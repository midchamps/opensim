import Phaser from 'phaser';
import { BaseTower } from './BaseTower';
import { createProjectile, safeAddSound } from '../utils';
import * as CONFIG from '../gameConfig.json';
// ============================================================================
// _TEMPLATE TOWER — Copy this file to create a new tower type
// ============================================================================
// Operation: COPY
//
// Steps:
// 1. Copy this file → rename to your tower class (e.g., ArrowTower.ts)
// 2. Rename the class
// 3. Update TOWER_CONFIG with your tower's stats from the GDD
// 4. Override hooks as needed for custom behavior
// 5. Export from towers/index.ts
// 6. Register in the level's getTowerTypes() method
// ============================================================================
// TODO-CONFIG: Define tower config using GDD values
export const TEMPLATE_TOWER_CONFIG = {
    id: 'basic_tower', // TODO-GDD: Unique tower type ID
    name: 'Basic Tower', // TODO-GDD: Display name
    textureKey: 'tower_basic', // TODO-ASSET: Match asset key from Preloader
    cost: 50, // TODO-GDD: Gold cost
    damage: 10, // TODO-GDD: Damage per hit
    range: 150, // TODO-GDD: Range in pixels
    fireRate: 1.0, // TODO-GDD: Shots per second
    projectileKey: 'tower_bullet', // TODO-ASSET: Projectile asset key (custom image or 'tower_bullet')
    projectileSpeed: 300, // TODO-GDD: Projectile speed pixels/sec
    homing: false, // TODO-GDD: Set true for homing/tracking projectiles
    targetingMode: 'first', // 'first' | 'last' | 'closest' | 'strongest'
    upgrades: [
        // TODO-GDD: Define upgrade levels from GDD
        { level: 2, cost: 40, damage: 18, range: 160, fireRate: 1.2 },
        { level: 3, cost: 80, damage: 30, range: 180, fireRate: 1.5 },
    ],
};
export class _TemplateTower extends BaseTower {
}
//# sourceMappingURL=_TemplateTower.js.map