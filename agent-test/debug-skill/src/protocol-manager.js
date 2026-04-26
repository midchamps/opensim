import * as fs from 'fs/promises';
import * as path from 'path';
import { OUTPUT_PATH, PROTOCOL_JSON_PATH, PROTOCOL_MD_PATH, SEED_JSON_PATH, HISTORY_PATH, } from './config.js';
// =============================================================================
// Protocol Manager — reads, writes, and queries the living protocol P
// =============================================================================
/**
 * Load the live protocol from disk, or initialize from seed if none exists.
 */
export async function loadOrInitProtocol() {
    try {
        const raw = await fs.readFile(PROTOCOL_JSON_PATH, 'utf-8');
        return JSON.parse(raw);
    }
    catch {
        console.log('[ProtocolManager] No live protocol found, initializing from seed...');
        return initFromSeed();
    }
}
/**
 * Initialize a fresh protocol from the seed protocol (P0).
 */
export async function initFromSeed() {
    const raw = await fs.readFile(SEED_JSON_PATH, 'utf-8');
    const seed = JSON.parse(raw);
    const protocol = {
        ...seed,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    await saveProtocol(protocol);
    return protocol;
}
/**
 * Persist the protocol to disk (both JSON and rendered Markdown).
 */
export async function saveProtocol(protocol) {
    await fs.mkdir(OUTPUT_PATH, { recursive: true });
    await fs.mkdir(HISTORY_PATH, { recursive: true });
    protocol.updatedAt = new Date().toISOString();
    // Save JSON (entries store metadata only; large patches are referenced)
    await fs.writeFile(PROTOCOL_JSON_PATH, JSON.stringify(protocol, null, 2));
    // Render readable Markdown
    const md = renderProtocolMarkdown(protocol);
    await fs.writeFile(PROTOCOL_MD_PATH, md);
}
/**
 * Bump version and save.
 */
export async function bumpAndSave(protocol) {
    protocol.version += 1;
    await saveProtocol(protocol);
}
// -----------------------------------------------------------------------------
// Query helpers
// -----------------------------------------------------------------------------
/** Get all reactive entries. */
export function getReactiveEntries(protocol) {
    return protocol.entries.filter((e) => e.kind === 'reactive');
}
/** Get all proactive entries. */
export function getProactiveEntries(protocol) {
    return protocol.entries.filter((e) => e.kind === 'proactive');
}
/** Find entries matching a given error code. */
export function findByErrorCode(protocol, errorCode) {
    return protocol.entries.filter((e) => e.signature.errorCode === errorCode);
}
/** Find entries matching a given tag. */
export function findByTag(protocol, tag) {
    return protocol.entries.filter((e) => e.tags.includes(tag));
}
/** Find an entry by ID. */
export function findById(protocol, id) {
    return protocol.entries.find((e) => e.id === id);
}
/** Find a rule by ID. */
export function findRuleById(protocol, id) {
    return protocol.rules.find((r) => r.id === id);
}
/**
 * Add a new entry to the protocol.
 * Returns the protocol with the entry appended.
 */
export function addEntry(protocol, entry) {
    protocol.entries.push(entry);
    return protocol;
}
/**
 * Add a new rule to the protocol.
 */
export function addRule(protocol, rule) {
    protocol.rules.push(rule);
    return protocol;
}
/**
 * Increment occurrence count and update lastMatchedAt for an entry.
 */
export function recordMatch(protocol, entryId, projectPath) {
    const entry = protocol.entries.find((e) => e.id === entryId);
    if (!entry)
        return;
    entry.occurrences += 1;
    entry.lastMatchedAt = new Date().toISOString();
    if (!entry.contributingProjects.includes(projectPath)) {
        entry.contributingProjects.push(projectPath);
    }
}
// -----------------------------------------------------------------------------
// Debug trace persistence
// -----------------------------------------------------------------------------
/**
 * Save a debug trace for a specific project.
 */
export async function saveTrace(projectId, trace) {
    const traceDir = path.join(HISTORY_PATH, projectId);
    await fs.mkdir(traceDir, { recursive: true });
    const tracePath = path.join(traceDir, 'trace.json');
    await fs.writeFile(tracePath, JSON.stringify(trace, null, 2));
    return tracePath;
}
// -----------------------------------------------------------------------------
// Markdown renderer
// -----------------------------------------------------------------------------
function renderProtocolMarkdown(protocol) {
    const lines = [];
    lines.push('# Debug Protocol (Auto-Generated)');
    lines.push('');
    lines.push(`> Version: ${protocol.version} | Updated: ${protocol.updatedAt}`);
    lines.push(`> Entries: ${protocol.entries.length} | Rules: ${protocol.rules.length}`);
    lines.push('');
    // Proactive entries
    const proactive = getProactiveEntries(protocol);
    if (proactive.length > 0) {
        lines.push('## Pre-Execution Validations');
        lines.push('');
        for (const entry of proactive) {
            lines.push(`### ${entry.signature.errorCode}`);
            lines.push('');
            lines.push(`- **Pattern**: \`${entry.signature.messagePattern}\``);
            lines.push(`- **Root Cause**: ${entry.rootCause}`);
            lines.push(`- **Fix**: ${entry.fix.description}`);
            lines.push(`- **Occurrences**: ${entry.occurrences}`);
            lines.push('');
        }
    }
    // Reactive entries
    const reactive = getReactiveEntries(protocol);
    if (reactive.length > 0) {
        lines.push('## Error Diagnosis Entries');
        lines.push('');
        lines.push('| Error Code | Stage | Pattern | Root Cause | Fix | Hits |');
        lines.push('|------------|-------|---------|------------|-----|------|');
        for (const entry of reactive) {
            lines.push(`| \`${entry.signature.errorCode}\` ` +
                `| ${entry.signature.stage} ` +
                `| \`${entry.signature.messagePattern}\` ` +
                `| ${entry.rootCause.slice(0, 80)}... ` +
                `| ${entry.fix.description.slice(0, 60)}... ` +
                `| ${entry.occurrences} |`);
        }
        lines.push('');
    }
    // Rules
    if (protocol.rules.length > 0) {
        lines.push('## Generalized Rules');
        lines.push('');
        for (const rule of protocol.rules) {
            lines.push(`### ${rule.name}`);
            lines.push('');
            lines.push(`- **Description**: ${rule.description}`);
            lines.push(`- **Action**: ${rule.action}`);
            lines.push(`- **Preconditions**: ${rule.preconditions.join(', ')}`);
            lines.push(`- **Derived from**: ${rule.derivedFrom.length} entries`);
            lines.push(`- **Preventions**: ${rule.preventionCount}`);
            lines.push('');
        }
    }
    return lines.join('\n');
}
//# sourceMappingURL=protocol-manager.js.map