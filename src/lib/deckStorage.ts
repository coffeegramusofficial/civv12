import { CardData, Faction, CARDS } from "./cards";

export interface SavedDeck {
  id: string;
  name: string;
  faction: Faction;
  cardNames: string[]; // Store card names instead of full data
  createdAt: number;
  version: number; // Schema version for future migrations
}

const STORAGE_KEY = "russian_civil_war_decks";
const MAX_DECKS = 10;
const CURRENT_VERSION = 1;

export const saveDeck = (name: string, faction: Faction, cards: CardData[]): void => {
  const decks = getAllDecks();
  
  const newDeck: SavedDeck = {
    id: `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    faction,
    cardNames: cards.map(c => c.name),
    createdAt: Date.now(),
    version: CURRENT_VERSION
  };
  
  // Add new deck, limiting to MAX_DECKS
  const updatedDecks = [newDeck, ...decks].slice(0, MAX_DECKS);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDecks));
};

// Legacy deck format for migration
interface LegacyDeck {
  id: string;
  name: string;
  faction: Faction;
  cards: CardData[];
  createdAt: number;
}

export const getAllDecks = (): SavedDeck[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    const migratedDecks: SavedDeck[] = [];
    
    for (const deck of parsed) {
      // Check if this is a legacy deck (has cards array instead of cardNames)
      if ('cards' in deck && Array.isArray(deck.cards)) {
        // Migrate legacy deck
        const legacyDeck = deck as LegacyDeck;
        migratedDecks.push({
          id: legacyDeck.id,
          name: legacyDeck.name,
          faction: legacyDeck.faction,
          cardNames: legacyDeck.cards.map(c => c.name),
          createdAt: legacyDeck.createdAt,
          version: CURRENT_VERSION
        });
      } else if ('cardNames' in deck && Array.isArray(deck.cardNames)) {
        // Already in new format
        migratedDecks.push(deck);
      }
      // Skip invalid decks
    }
    
    // Save migrated decks back
    if (migratedDecks.length > 0 && migratedDecks.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedDecks));
    }
    
    return migratedDecks;
  } catch (error) {
    console.error("Failed to parse saved decks:", error);
    return [];
  }
};

export const getDecksByFaction = (faction: Faction): SavedDeck[] => {
  return getAllDecks().filter(deck => deck.faction === faction);
};

export const loadDeck = (deckId: string): CardData[] | null => {
  const decks = getAllDecks();
  const deck = decks.find(deck => deck.id === deckId);
  
  if (!deck) return null;
  
  // Reconstruct cards from names, validating they exist and match faction
  const cards: CardData[] = [];
  for (const cardName of deck.cardNames) {
    const card = CARDS.find(c => c.name === cardName && c.faction === deck.faction);
    if (card) {
      cards.push(card);
    }
  }
  
  // Validate deck has correct size
  if (cards.length !== deck.cardNames.length) {
    console.warn(`Deck ${deck.name} has missing/invalid cards`);
    return null;
  }
  
  return cards;
};

export const deleteDeck = (deckId: string): void => {
  const decks = getAllDecks();
  const updatedDecks = decks.filter(deck => deck.id !== deckId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDecks));
};
