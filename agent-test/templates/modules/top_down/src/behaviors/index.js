/**
 * Behaviors - Reusable behavior components for top-down games
 *
 * Behaviors follow the Component pattern - entities are composed of behaviors
 * rather than inheriting from complex class hierarchies.
 *
 * Available behaviors:
 * - EightWayMovement: 8-directional movement with diagonal normalization
 * - FaceTarget: Mouse/target aiming and facing direction
 * - MeleeAttack: 360° close-range combat (4-directional trigger)
 * - RangedAttack: 360° projectile-based combat (any-angle shooting)
 * - DashAbility: Dash/dodge with i-frames and cooldown
 * - PatrolAI: 2D area wandering for enemies
 * - ChaseAI: 2D target chasing for enemies
 *
 * Usage:
 *   import { BehaviorManager, EightWayMovement, FaceTarget } from './behaviors';
 *
 *   // In entity constructor:
 *   this.behaviors = new BehaviorManager(this);
 *   this.movement = this.behaviors.add('movement', new EightWayMovement({
 *     walkSpeed: 200,
 *   }));
 *   this.faceTarget = this.behaviors.add('faceTarget', new FaceTarget());
 *
 *   // In entity update:
 *   this.behaviors.update();
 */
// Core
export { BaseBehavior } from './IBehavior';
export { BehaviorManager } from './BehaviorManager';
// Movement
export { EightWayMovement, } from './EightWayMovement';
export { FaceTarget } from './FaceTarget';
export { DashAbility } from './DashAbility';
// Combat
export { MeleeAttack } from './MeleeAttack';
export { RangedAttack } from './RangedAttack';
// Screen Effects
export { ScreenEffectHelper, } from './ScreenEffectHelper';
// AI
export { PatrolAI } from './PatrolAI';
export { ChaseAI } from './ChaseAI';
//# sourceMappingURL=index.js.map