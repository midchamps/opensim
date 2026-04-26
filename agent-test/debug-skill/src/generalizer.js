import { randomBytes } from 'node:crypto';
import { addRule } from './protocol-manager.js';
import { getGeneralizerConfig, GENERALIZATION_THRESHOLD } from './config.js';
/**
 * Scan the protocol for repeated patterns and generate rules.
 */
export async function generalizeProtocol(protocol) {
    const newRules = [];
    // Group reactive entries by errorCode
    const groups = groupByErrorCode(protocol.entries);
    for (const [errorCode, entries] of groups) {
        // Skip if below threshold
        if (entries.length < GENERALIZATION_THRESHOLD)
            continue;
        // Skip if a rule already exists for this errorCode
        const existingRule = protocol.rules.find((r) => r.derivedFrom.some((id) => entries.some((e) => e.id === id)));
        if (existingRule)
            continue;
        // Generate a rule from the group
        const rule = await generateRule(errorCode, entries);
        if (rule) {
            addRule(protocol, rule);
            newRules.push(rule);
            const logEntry = {
                taskId: `gen-${Date.now()}-${randomBytes(3).toString('hex')}`,
                timestamp: new Date().toISOString(),
                projectPath: '',
                action: 'generalized_rule',
                ruleId: rule.id,
                details: `Generalized ${entries.length} entries into rule: ${rule.name}`,
            };
            protocol.evolutionLog.push(logEntry);
        }
    }
    return { newRules, protocol };
}
// -----------------------------------------------------------------------------
// Grouping
// -----------------------------------------------------------------------------
function groupByErrorCode(entries) {
    const groups = new Map();
    for (const entry of entries) {
        if (entry.kind !== 'reactive')
            continue;
        const code = entry.signature.errorCode;
        const group = groups.get(code) ?? [];
        group.push(entry);
        groups.set(code, group);
    }
    return groups;
}
// -----------------------------------------------------------------------------
// Rule generation
// -----------------------------------------------------------------------------
async function generateRule(errorCode, entries) {
    // First try LLM-based rule generation
    try {
        const llmRule = await llmGenerateRule(errorCode, entries);
        if (llmRule)
            return llmRule;
    }
    catch {
        // Fall through to rule-based
    }
    // Fallback: rule-based generalization
    return ruleBasedGeneralize(errorCode, entries);
}
/**
 * Rule-based generalization: aggregate common patterns from entries.
 */
function ruleBasedGeneralize(errorCode, entries) {
    const id = `rule-${errorCode.toLowerCase()}-${randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();
    // Extract common tags
    const tagCounts = new Map();
    for (const entry of entries) {
        for (const tag of entry.tags) {
            tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
        }
    }
    const commonTags = [...tagCounts.entries()]
        .filter(([, count]) => count >= entries.length * 0.5)
        .map(([tag]) => tag);
    // Build validation checks from file contexts
    const checks = [];
    const fileContexts = new Set(entries
        .map((e) => e.signature.fileContext)
        .filter((ctx) => ctx !== undefined));
    for (const fileContext of fileContexts) {
        // Collect message patterns for this context
        const patterns = entries
            .filter((e) => e.signature.fileContext === fileContext)
            .map((e) => e.signature.messagePattern);
        for (const pattern of patterns) {
            checks.push({
                target: 'file',
                filePattern: fileContext,
                query: pattern,
                violationMessage: `Pattern "${errorCode}" detected: ${entries[0].rootCause.slice(0, 80)}`,
            });
        }
    }
    // Compute a descriptive name
    const name = `${errorCode} prevention (${commonTags.join(', ') || 'general'})`;
    const description = entries
        .map((e) => e.rootCause)
        .slice(0, 3)
        .join('; ');
    return {
        id,
        name,
        description: `Generalized from ${entries.length} occurrences. Common causes: ${description}`,
        preconditions: fileContexts.size > 0
            ? [...fileContexts].map((ctx) => `files matching ${ctx} exist`)
            : ['project has TypeScript source files'],
        action: 'flag',
        checks,
        derivedFrom: entries.map((e) => e.id),
        preventionCount: 0,
        createdAt: now,
        updatedAt: now,
    };
}
async function llmGenerateRule(errorCode, entries) {
    const config = getGeneralizerConfig();
    if (!config.apiKey)
        return null;
    const entrySummaries = entries
        .map((e, i) => `${i + 1}. [${e.signature.stage}] ${e.signature.messagePattern}\n   Root cause: ${e.rootCause}\n   Fix: ${e.fix.description}`)
        .join('\n');
    const systemPrompt = `You are a pattern generalizer for a game project debug protocol.
Given multiple related error entries, produce a generalized validation rule that can PREVENT these errors proactively.

Output ONLY a JSON object:
{
  "name": "short rule name",
  "description": "what this rule checks and why",
  "preconditions": ["when this rule applies"],
  "action": "flag | fix | block",
  "checks": [
    {
      "target": "file | config | imports | scene-registration | assets",
      "filePattern": "glob pattern (optional)",
      "query": "what to check (regex or description)",
      "violationMessage": "human-readable violation message"
    }
  ]
}`;
    const userPrompt = `Error code: ${errorCode}
Number of occurrences: ${entries.length}

Related entries:
${entrySummaries}

Generalize these into a single reusable validation rule.`;
    const content = await callLLM(config, systemPrompt, userPrompt);
    if (!content)
        return null;
    return parseLLMRule(content, errorCode, entries);
}
function parseLLMRule(content, errorCode, entries) {
    try {
        let jsonStr = content.trim();
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        }
        const parsed = JSON.parse(jsonStr);
        const now = new Date().toISOString();
        const id = `rule-${errorCode.toLowerCase()}-${randomBytes(4).toString('hex')}`;
        const checks = [];
        if (Array.isArray(parsed['checks'])) {
            for (const check of parsed['checks']) {
                checks.push({
                    target: check['target'] || 'file',
                    filePattern: check['filePattern'],
                    query: check['query'] || '',
                    violationMessage: check['violationMessage'] || '',
                });
            }
        }
        return {
            id,
            name: parsed['name'] || `${errorCode} rule`,
            description: parsed['description'] || '',
            preconditions: parsed['preconditions'] || [],
            action: (['flag', 'fix', 'block'].includes(parsed['action'])
                ? parsed['action']
                : 'flag'),
            checks,
            derivedFrom: entries.map((e) => e.id),
            preventionCount: 0,
            createdAt: now,
            updatedAt: now,
        };
    }
    catch {
        return null;
    }
}
async function callLLM(config, systemPrompt, userPrompt) {
    const payload = {
        model: config.modelName,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: false,
    };
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(config.timeout),
    });
    if (!response.ok)
        return null;
    const data = (await response.json());
    return data.choices?.[0]?.message?.content ?? null;
}
//# sourceMappingURL=generalizer.js.map