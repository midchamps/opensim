/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility for converting JSON Schemas to be compatible with different LLM providers.
 * Specifically focuses on downgrading modern JSON Schema (Draft 7/2020-12) to
 * OpenAPI 3.0 compatible Schema Objects, which is required for Google Gemini API.
 */

export type SchemaComplianceMode = 'auto' | 'openapi_30';

/**
 * Converts a JSON Schema to be compatible with the specified compliance mode.
 */
export function convertSchema(
  schema: Record<string, unknown>,
  mode: SchemaComplianceMode = 'auto',
): Record<string, unknown> {
  if (process.env['OPENGAME_DEBUG_GEMINI']) {
    const hasOneOf = JSON.stringify(schema).includes('"oneOf"');
    const stackLines = new Error().stack?.split('\n').slice(2, 6) || [];
    const caller = stackLines
      .map((l) => l.trim())
      .find(
        (l) =>
          l.includes('converter') ||
          l.includes('Pipeline') ||
          l.includes('Logging') ||
          l.includes('Anthropic'),
      ) || stackLines[0] || '?';
    process.stderr.write(
      `[opengame-debug] convertSchema mode=${mode} hasOneOf=${hasOneOf} caller=${caller.slice(0, 120)}\n`,
    );
  }
  // Global Gemini kill-switch: if the env signals the session is talking to
  // a Gemini-shaped endpoint (set by contentGenerator.ts when it detects
  // Gemini), ALWAYS downgrade the schema — regardless of what the caller
  // passed for `mode`. This catches code paths that build their own
  // converter with a default 'auto' mode and would otherwise leak
  // oneOf/const/$schema past the wire.
  if (
    mode === 'openapi_30' ||
    process.env['OPENGAME_FORCE_OPENAPI30'] === '1'
  ) {
    return toOpenAPI30(schema);
  }

  // Default ('auto') mode now does nothing.
  return schema;
}

/**
 * Converts Modern JSON Schema to OpenAPI 3.0 Schema Object.
 * Attempts to preserve semantics where possible through transformations.
 */
function toOpenAPI30(schema: Record<string, unknown>): Record<string, unknown> {
  const convert = (obj: unknown): unknown => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(convert);
    }

    const source = obj as Record<string, unknown>;
    const target: Record<string, unknown> = {};

    // 1. Type Handling
    if (Array.isArray(source['type'])) {
      const types = source['type'] as string[];
      // Handle ["string", "null"] pattern common in modern schemas
      if (types.length === 2 && types.includes('null')) {
        target['type'] = types.find((t) => t !== 'null');
        target['nullable'] = true;
      } else {
        // Fallback for other unions: take the first non-null type
        // OpenAPI 3.0 doesn't support type arrays.
        // Ideal fix would be anyOf, but simple fallback is safer for now.
        target['type'] = types[0];
      }
    } else if (source['type'] !== undefined) {
      target['type'] = source['type'];
    }

    // 2. Const Handling (Draft 6+) -> Enum (OpenAPI 3.0)
    if (source['const'] !== undefined) {
      target['enum'] = [source['const']];
      delete target['const'];
    }

    // 3. Exclusive Limits (Draft 6+ number) -> (Draft 4 boolean)
    // exclusiveMinimum: 10 -> minimum: 10, exclusiveMinimum: true
    if (typeof source['exclusiveMinimum'] === 'number') {
      target['minimum'] = source['exclusiveMinimum'];
      target['exclusiveMinimum'] = true;
    }
    if (typeof source['exclusiveMaximum'] === 'number') {
      target['maximum'] = source['exclusiveMaximum'];
      target['exclusiveMaximum'] = true;
    }

    // 4. Array Items (Tuple -> Single Schema)
    // OpenAPI 3.0 items must be a schema object, not an array of schemas
    if (Array.isArray(source['items'])) {
      // Tuple support is tricky.
      // Best effort: Use the first item's schema as a generic array type
      // or convert to an empty object (any type) if mixed.
      // For now, we'll strip it to allow validation to pass (accepts any items)
      // This matches the legacy behavior but is explicit.
      // Ideally, we could use `oneOf` on the items if we wanted to be stricter.
      delete target['items'];
    } else if (
      typeof source['items'] === 'object' &&
      source['items'] !== null
    ) {
      target['items'] = convert(source['items']);
    }

    // 5. Enum Stringification
    // Gemini strictly requires enums to be strings
    if (Array.isArray(source['enum'])) {
      target['enum'] = source['enum'].map(String);
    }

    // 6. Union keywords (oneOf / anyOf / allOf) handling.
    //    Gemini's tool-schema dialect does not accept these at all — even
    //    though OpenAPI 3.0 technically permits them. The safest cross-
    //    provider move is to drop the union keywords and, when possible,
    //    merge properties from the variants into the parent so the model
    //    still sees the shape. If variants have incompatible `type`s, we
    //    fall back to a bare `type: object` with no constraints.
    const unionKey = (['oneOf', 'anyOf', 'allOf'] as const).find(
      (k) => Array.isArray(source[k]) && (source[k] as unknown[]).length > 0,
    );
    if (unionKey) {
      const variants = source[unionKey] as Array<Record<string, unknown>>;
      const mergedProps: Record<string, unknown> = {};
      const sharedType = variants[0]?.['type'];
      const allSameType = variants.every((v) => v?.['type'] === sharedType);
      for (const v of variants) {
        const props = v?.['properties'];
        if (props && typeof props === 'object') {
          for (const [pk, pv] of Object.entries(
            props as Record<string, unknown>,
          )) {
            if (!(pk in mergedProps)) mergedProps[pk] = convert(pv);
          }
        }
      }
      if (allSameType && sharedType === 'object') {
        target['type'] = 'object';
        if (Object.keys(mergedProps).length > 0) {
          target['properties'] = mergedProps;
        }
      } else if (!target['type']) {
        // No shared object shape — leave it as an untyped object so Gemini
        // accepts the schema and the model relies on descriptions.
        target['type'] = 'object';
      }
      // Do NOT emit the union keyword. Fall through to the generic loop so
      // any sibling keys (description, etc.) still get copied.
    }

    // 7. Recursively process other properties
    for (const [key, value] of Object.entries(source)) {
      // Skip fields we've already handled or want to remove
      if (
        key === 'type' ||
        key === 'const' ||
        key === 'exclusiveMinimum' ||
        key === 'exclusiveMaximum' ||
        key === 'items' ||
        key === 'enum' ||
        key === '$schema' ||
        key === '$id' ||
        key === 'default' || // Optional: Gemini sometimes complains about defaults conflicting with types
        key === 'dependencies' ||
        key === 'patternProperties' ||
        key === 'oneOf' ||
        key === 'anyOf' ||
        key === 'allOf' ||
        (unionKey && key === 'properties') // already merged above
      ) {
        continue;
      }

      target[key] = convert(value);
    }

    // Preserve default if it doesn't conflict (simple pass-through)
    // if (source['default'] !== undefined) {
    //   target['default'] = source['default'];
    // }

    return target;
  };

  return convert(schema) as Record<string, unknown>;
}
