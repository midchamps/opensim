import { BaseEntity } from './BaseEntity';
/**
 * _TemplateEntity — COPY this file to create a new entity type.
 *
 * Usage:
 *   1. Copy this file and rename it (e.g., Player.ts, Enemy.ts)
 *   2. Rename the class
 *   3. Add physics body, behaviors, and game-specific logic
 *   4. Override hooks as needed
 */
export class _TemplateEntity extends BaseEntity {
    constructor(scene, x, y) {
        super(scene, x, y, 'placeholder_texture'); // <-- set your texture key
    }
    onUpdate(_time, _delta) {
        // TODO: per-frame logic
    }
    onDamageTaken(_damage) {
        // TODO: damage reaction
    }
    onDeath() {
        super.onDeath();
        // TODO: death effects
    }
}
//# sourceMappingURL=_TemplateEntity.js.map