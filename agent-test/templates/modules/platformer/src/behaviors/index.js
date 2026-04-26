/**
 * Behaviors - Reusable behavior components for platformer games
 *
 * Behaviors follow the Component pattern - entities are composed of behaviors
 * rather than inheriting from complex class hierarchies.
 *
 * Available behaviors:
 * - PlatformerMovement: Horizontal movement and jumping
 * - MeleeAttack: Close-range combat
 * - RangedAttack: Projectile-based combat
 * - PatrolAI: Walk back and forth
 * - ChaseAI: Follow a target
 * - SkillBehavior: Base class for special skills with cooldown
 *   - DashAttackSkill: Linear dash with collision
 *   - AreaDamageSkill: AOE damage around player
 *   - TargetedExecutionSkill: Lock-on instant kill
 *   - TargetedAOESkill: Lock-on with AOE at target
 *   - BeamAttackSkill: Horizontal beam attack
 *   - GroundQuakeSkill: Ground slam (grounded enemies only)
 *   - BoomerangSkill: Returning projectile (hammer, shuriken)
 *   - MultishotSkill: Spread-fire multiple projectiles
 *   - ArcProjectileSkill: Gravity arc projectile (boulder, grenade)
 *
 * Usage:
 *   import { BehaviorManager, PlatformerMovement } from './behaviors';
 *
 *   // In entity constructor:
 *   this.behaviors = new BehaviorManager(this);
 *   this.movement = this.behaviors.add('movement', new PlatformerMovement({
 *     walkSpeed: 200,
 *     jumpPower: 600,
 *   }));
 *
 *   // In entity update:
 *   this.behaviors.update();
 */
// Core
export { BaseBehavior } from './IBehavior';
export { BehaviorManager } from './BehaviorManager';
// Movement
export { PlatformerMovement, } from './PlatformerMovement';
// Combat
export { MeleeAttack } from './MeleeAttack';
export { RangedAttack } from './RangedAttack';
// Skills
export { SkillBehavior, DashAttackSkill, AreaDamageSkill, TargetedExecutionSkill, TargetedAOESkill, BeamAttackSkill, GroundQuakeSkill, BoomerangSkill, MultishotSkill, ArcProjectileSkill, } from './SkillBehavior';
// Screen Effects
export { ScreenEffectHelper, } from './ScreenEffectHelper';
// AI
export { PatrolAI } from './PatrolAI';
export { ChaseAI } from './ChaseAI';
//# sourceMappingURL=index.js.map