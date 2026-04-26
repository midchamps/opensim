/**
 * ============================================================================
 * CARD MANAGER - Deck & hand lifecycle management
 * ============================================================================
 *
 * Manages the card game lifecycle: deck construction, shuffling,
 * drawing, hand management, and discarding.
 *
 * This is a LOGIC-ONLY system. The Card UI component handles rendering.
 *
 * EVENTS (via Phaser.Events.EventEmitter):
 *   - 'cardDrawn': (card) => void
 *   - 'cardDiscarded': (card) => void
 *   - 'cardPlayed': (card) => void
 *   - 'handUpdated': (hand[]) => void
 *   - 'deckEmpty': () => void
 *   - 'deckShuffled': () => void
 *
 * USAGE:
 *   const cm = new CardManager(scene);
 *   cm.initDeck(cardConfigs);
 *   cm.shuffle();
 *   cm.drawToHand(3);
 *   const card = cm.getHand()[0];
 *   cm.playCard(card);
 */
import Phaser from 'phaser';
import { type CardConfig } from '../scenes/BaseBattleScene';
export declare class CardManager extends Phaser.Events.EventEmitter {
    private scene;
    private deck;
    private hand;
    private discardPile;
    private playedThisTurn;
    private maxHandSize;
    constructor(scene: Phaser.Scene, maxHandSize?: number);
    /** Initialize the deck with card configurations. */
    initDeck(cards: CardConfig[]): void;
    /** Shuffle the deck. */
    shuffle(): void;
    /** Draw cards from deck into hand (up to maxHandSize). */
    drawToHand(count: number): CardConfig[];
    /** Play a card from hand (removes it). */
    playCard(card: CardConfig): boolean;
    /** Discard a card from hand. */
    discardFromHand(card: CardConfig): boolean;
    /** Discard entire hand. */
    discardHand(): void;
    /** End turn: move played cards to discard. */
    endTurn(): void;
    getHand(): CardConfig[];
    getDeckSize(): number;
    getDiscardSize(): number;
    /** Reshuffle discard pile back into deck. */
    private reshuffleDiscard;
}
