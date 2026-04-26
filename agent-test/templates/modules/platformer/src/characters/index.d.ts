/**
 * Characters - Player and Enemy base classes for platformer games
 *
 * This module provides:
 * - BasePlayer: Foundation for player characters with FSM and Behaviors
 * - BaseEnemy: Foundation for enemy characters with AI and Behaviors
 * - PlayerFSM: State machine for player states
 * - Template files for Agent to copy
 *
 * Usage:
 *   // Copy _TemplatePlayer.ts and rename to create your player
 *   // Copy _TemplateEnemy.ts and rename to create enemies
 */
export { BasePlayer, type PlayerConfig } from './BasePlayer';
export { BaseEnemy, type EnemyConfig, type EnemyAIType } from './BaseEnemy';
export { PlayerFSM, type PlayerAnimKeys, DEFAULT_PLAYER_ANIM_KEYS, } from './PlayerFSM';
