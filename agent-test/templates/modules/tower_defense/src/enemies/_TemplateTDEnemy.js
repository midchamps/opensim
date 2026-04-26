import Phaser from 'phaser';
import { BaseTDEnemy } from './BaseTDEnemy';
import * as CONFIG from '../gameConfig.json';
// ============================================================================
// _TEMPLATE TD ENEMY — Copy this file to create a new enemy type
// ============================================================================
// Operation: COPY
//
// Steps:
// 1. Copy this file → rename to your enemy class (e.g., Goblin.ts)
// 2. Rename the class
// 3. Update the config object with your enemy's stats
// 4. Override hooks as needed for custom behavior
// 5. Export from enemies/index.ts
// ============================================================================
// TODO-CONFIG: Define enemy config using GDD values
const ENEMY_CONFIG = {
    textureKey: 'enemy_basic', // TODO-ASSET: Match asset key from Preloader
    displayHeight: 48, // TODO-GDD: Adjust based on GDD art direction
    stats: {
        maxHealth: 100, // TODO-GDD: From GDD enemy stats
        speed: 80, // TODO-GDD: Pixels per second
        reward: 10, // TODO-GDD: Gold reward on kill
        damage: 1, // TODO-GDD: Lives lost if reaches exit
    },
};
export class _TemplateTDEnemy extends BaseTDEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, ENEMY_CONFIG);
    }
}
//# sourceMappingURL=_TemplateTDEnemy.js.map