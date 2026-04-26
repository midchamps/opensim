/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Unset NO_COLOR environment variable to ensure consistent theme behavior between local and CI test runs
if (process.env['NO_COLOR'] !== undefined) {
    delete process.env['NO_COLOR'];
}
import { setSimulate429 } from './src/utils/testUtils.js';
// Disable 429 simulation globally for all tests
setSimulate429(false);
// Some dependencies (e.g., undici) expect a global File constructor in Node.
// Provide a minimal shim for test environment if missing.
if (typeof globalThis.File === 'undefined') {
    globalThis.File = class {
    };
}
//# sourceMappingURL=test-setup.js.map