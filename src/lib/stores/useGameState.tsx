import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { CardData, Faction, getCardsByFaction } from "../cards";

export type GamePhase = "menu" | "decks" | "faction_select" | "settings" | "playing" | "game_over";

export interface GameCard extends CardData {
  id: string;
  position?: { x: number, z: number };
  currentHealth?: number;
  hasAttackedThisTurn?: boolean;
}

export interface Tower {
  id: string;
  health: number;
  maxHealth: number;
  position: { x: number, z: number };
  faction: Faction;
  isMain: boolean;
}

export interface Player {
  faction: Faction;
  supply: number;
  maxSupply: number;
  hand: GameCard[];
  deck: GameCard[];
  towers: Tower[];
}

interface GameState {
  gamePhase: GamePhase;
  selectedFaction: Faction;
  playerDeck: CardData[];
  currentTurn: 'player' | 'ai';
  turnNumber: number;
  
  // Game state
  player: Player | null;
  ai: Player | null;
  boardCards: GameCard[];
  selectedCard: GameCard | null;
  selectedAttacker: GameCard | null;
  winner: Faction | null;

  // Actions
  setGamePhase: (phase: GamePhase) => void;
  setSelectedFaction: (faction: Faction) => void;
  setPlayerDeck: (deck: CardData[]) => void;
  initializeGame: () => void;
  selectCard: (card: GameCard | null) => void;
  selectAttacker: (card: GameCard | null) => void;
  playCard: (card: GameCard, position: { x: number, z: number }) => void;
  playBonusCard: (card: GameCard, targetCardId: string) => void;
  attackWithCard: (attackerId: string, targetId: string) => void;
  endTurn: () => void;
  resetGame: () => void;
  damageCard: (cardId: string, damage: number) => void;
  damageTower: (towerId: string, damage: number) => void;
  updateBoardCards: (cards: GameCard[]) => void;
  updatePlayerTowers: (towers: Tower[]) => void;
  updateAITowers: (towers: Tower[]) => void;
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    gamePhase: "menu",
    selectedFaction: "whites",
    playerDeck: [],
    currentTurn: 'player',
    turnNumber: 1,
    
    player: null,
    ai: null,
    boardCards: [],
    selectedCard: null,
    selectedAttacker: null,
    winner: null,

    setGamePhase: (phase) => set({ gamePhase: phase }),
    setSelectedFaction: (faction) => set({ selectedFaction: faction }),
    setPlayerDeck: (deck) => set({ playerDeck: deck }),
    
    initializeGame: () => {
      const state = get();
      const playerFaction = state.selectedFaction;
      const aiFaction = playerFaction === "whites" ? "reds" : "whites";
      
      // Create towers for both players
      const createTowers = (faction: Faction, side: 'top' | 'bottom'): Tower[] => {
        const z = side === 'top' ? 8 : -8;
        return [
          { 
            id: `${faction}-main`, 
            health: 15, 
            maxHealth: 15, 
            position: { x: 0, z }, 
            faction, 
            isMain: true 
          },
          { 
            id: `${faction}-left`, 
            health: 10, 
            maxHealth: 10, 
            position: { x: -4, z }, 
            faction, 
            isMain: false 
          },
          { 
            id: `${faction}-right`, 
            health: 10, 
            maxHealth: 10, 
            position: { x: 4, z }, 
            faction, 
            isMain: false 
          }
        ];
      };

      const playerTowers = createTowers(playerFaction, 'bottom');
      const aiTowers = createTowers(aiFaction, 'top');

      // Initialize decks and hands
      const shuffleDeck = (deck: CardData[]): GameCard[] => {
        const shuffled = [...deck].sort(() => Math.random() - 0.5);
        return shuffled.map((card, index) => ({
          ...card,
          id: `${card.name}-${index}-${Date.now()}`
        }));
      };

      const playerShuffledDeck = shuffleDeck(state.playerDeck);
      const aiDeckCards = getCardsByFaction(aiFaction);
      const aiShuffledDeck = shuffleDeck(aiDeckCards);

      set({
        gamePhase: "playing",
        currentTurn: 'player',
        turnNumber: 1,
        player: {
          faction: playerFaction,
          supply: 3,
          maxSupply: 3,
          hand: playerShuffledDeck.slice(0, 4),
          deck: playerShuffledDeck.slice(4),
          towers: playerTowers
        },
        ai: {
          faction: aiFaction,
          supply: 3,
          maxSupply: 3,
          hand: aiShuffledDeck.slice(0, 4),
          deck: aiShuffledDeck.slice(4),
          towers: aiTowers
        },
        boardCards: [],
        selectedCard: null,
        winner: null
      });
    },

    selectCard: (card) => set({ selectedCard: card }),
    
    selectAttacker: (card) => set({ selectedAttacker: card }),

    playCard: (card, position) => {
      const state = get();
      if (!state.player || state.currentTurn !== 'player' || state.player.supply < card.cost) {
        return;
      }

      // Remove card from hand, add to board, reduce supply
      const newHand = state.player.hand.filter(c => c.id !== card.id);
      const cardWithPosition = { 
        ...card, 
        position, 
        currentHealth: card.type === 'unit' ? card.health : 0 
      };
      
      // Draw new card from deck if available
      let newDeck = state.player.deck;
      if (newDeck.length > 0) {
        newHand.push(newDeck[0]);
        newDeck = newDeck.slice(1);
      }

      set({
        player: {
          ...state.player,
          hand: newHand,
          deck: newDeck,
          supply: state.player.supply - card.cost
        },
        boardCards: [...state.boardCards, cardWithPosition],
        selectedCard: null
      });
    },

    endTurn: () => {
      const state = get();
      
      if (state.currentTurn === 'player') {
        // Reset all attack flags for new turn
        const resetBoardCards = state.boardCards.map(c => ({ ...c, hasAttackedThisTurn: false }));
        
        // Player turn ends, AI turn begins
        // AI gets +3 supply and +3 maxSupply at START of its turn
        set({ 
          currentTurn: 'ai',
          boardCards: resetBoardCards,
          player: state.player ? {
            ...state.player,
            supply: state.player.supply + 3,
            maxSupply: state.player.maxSupply + 3
          } : null,
          ai: state.ai ? {
            ...state.ai,
            supply: state.ai.supply + 3,
            maxSupply: state.ai.maxSupply + 3
          } : null
        });

        // AI Attack Phase - attacks with units on battlefield
        const aiAttackPhase = () => {
          setTimeout(() => {
            const attackState = get();
            if (!attackState.ai || !attackState.player) return;

            const aiUnits = attackState.boardCards.filter(c => 
              c.faction === attackState.ai!.faction && 
              c.type === 'unit' && 
              !c.hasAttackedThisTurn &&
              (c.currentHealth || 0) > 0
            );

            aiUnits.forEach(attacker => {
              // Determine valid targets based on unit class
              const playerCards = attackState.boardCards.filter(c => 
                c.faction === attackState.player!.faction && 
                c.type === 'unit' && 
                (c.currentHealth || 0) > 0
              );
              const playerTowers = attackState.player!.towers.filter(t => t.health > 0);

              let targetId: string | null = null;

              if (attacker.unitClass === 'spy') {
                // Spy attacks main tower directly
                const mainTower = playerTowers.find(t => t.isMain);
                if (mainTower) {
                  targetId = mainTower.id;
                }
              } else {
                // Normal units: attack cards first, then side towers, then main tower
                if (playerCards.length > 0) {
                  // Attack random player card
                  targetId = playerCards[Math.floor(Math.random() * playerCards.length)].id;
                } else {
                  // No player cards, attack towers
                  const sideTowers = playerTowers.filter(t => !t.isMain);
                  if (sideTowers.length > 0) {
                    // Attack random side tower
                    targetId = sideTowers[Math.floor(Math.random() * sideTowers.length)].id;
                  } else if (playerTowers.length > 0) {
                    // Attack main tower
                    targetId = playerTowers[0].id;
                  }
                }
              }

              // Execute attack
              if (targetId) {
                const isTowerTarget = targetId.includes('main') || targetId.includes('left') || targetId.includes('right');
                
                if (isTowerTarget) {
                  get().damageTower(targetId, attacker.buildingDamage);
                } else {
                  const targetCard = attackState.boardCards.find(c => c.id === targetId);
                  get().damageCard(targetId, attacker.damage);
                  
                  // Counter-attack from target
                  if (targetCard && targetCard.defense > 0) {
                    get().damageCard(attacker.id, targetCard.defense);
                  }
                }

                // Mark as attacked
                const updatedCards = get().boardCards.map(c => 
                  c.id === attacker.id ? { ...c, hasAttackedThisTurn: true } : c
                );
                set({ boardCards: updatedCards });
              }
            });

            // End AI turn after attacks
            setTimeout(() => {
              const finalState = get();
              // Reset all attack flags for new turn
              const resetBoardCards = finalState.boardCards.map(c => ({ ...c, hasAttackedThisTurn: false }));
              
              // Player's turn starts - NO supply increase for AI here (it gets it at start of its turn)
              set({
                currentTurn: 'player',
                turnNumber: finalState.turnNumber + 1,
                boardCards: resetBoardCards
              });
            }, 1500);
          }, 800);
        };

        // Recursive function to play AI cards one by one
        const playNextAICard = () => {
          const currentState = get();
          if (!currentState.ai || currentState.ai.hand.length === 0) {
            // No more cards to play, proceed to attack phase
            aiAttackPhase();
            return;
          }

          let cardPlayed = false;
          
          // Try to play aerial bombardment first if available
          const aerialCards = currentState.ai.hand.filter(card => 
            card.type === 'bonus' && card.bonusClass === 'aerial' && card.cost <= currentState.ai!.supply
          );
          
          if (aerialCards.length > 0 && currentState.player) {
            const aerialCard = aerialCards[0];
            const playerTowers = currentState.player.towers.filter(t => t.health > 0);
            
            if (playerTowers.length > 0) {
              // Target main tower if available, otherwise any tower
              const targetTower = playerTowers.find(t => t.isMain) || playerTowers[0];
              
              const newHand = currentState.ai.hand.filter(c => c.id !== aerialCard.id);
              let newDeck = currentState.ai.deck;
              if (newDeck.length > 0) {
                newHand.push(newDeck[0]);
                newDeck = newDeck.slice(1);
              }
              
              get().damageTower(targetTower.id, aerialCard.bonusEffect?.value || 0);
              
              set({
                ai: {
                  ...currentState.ai,
                  hand: newHand,
                  deck: newDeck,
                  supply: currentState.ai.supply - aerialCard.cost
                }
              });
              
              cardPlayed = true;
            }
          }
          
          // If no aerial card played, try to play units
          if (!cardPlayed) {
            const playableCards = currentState.ai.hand.filter(card => 
              card.type === 'unit' && card.cost <= currentState.ai!.supply
            );
            
            if (playableCards.length > 0) {
              // Prioritize higher attack units
              const sortedCards = [...playableCards].sort((a, b) => 
                (b.damage + b.buildingDamage) - (a.damage + a.buildingDamage)
              );
              
              const selectedCard = sortedCards[0];
              
              // Strategic positioning
              const playerCards = currentState.boardCards.filter(c => 
                c.faction === currentState.player?.faction && c.type === 'unit'
              );
              
              let position;
              if (playerCards.length > 0) {
                // Position near enemy units to block them
                const targetCard = playerCards[0];
                position = {
                  x: (targetCard.position?.x || 0) + (Math.random() - 0.5) * 2,
                  z: (targetCard.position?.z || -4) + 3
                };
              } else {
                // Position aggressively toward player towers
                position = {
                  x: (Math.random() - 0.5) * 6,
                  z: Math.random() * 2 + 4 // AI side, closer to center
                };
              }

              // AI plays card
              const newHand = currentState.ai.hand.filter(c => c.id !== selectedCard.id);
              
              const cardWithPosition = { 
                ...selectedCard, 
                position,
                currentHealth: selectedCard.type === 'unit' ? selectedCard.health : 0 
              };
              
              let newDeck = currentState.ai.deck;
              if (newDeck.length > 0) {
                newHand.push(newDeck[0]);
                newDeck = newDeck.slice(1);
              }

              set({
                ai: {
                  ...currentState.ai,
                  hand: newHand,
                  deck: newDeck,
                  supply: currentState.ai.supply - selectedCard.cost
                },
                boardCards: [...currentState.boardCards, cardWithPosition]
              });
              
              cardPlayed = true;
            }
          }
          
          // If a card was played, try to play another one after a delay
          if (cardPlayed) {
            setTimeout(playNextAICard, 600); // Play next card after 600ms
          } else {
            // No more playable cards, proceed to attack phase
            aiAttackPhase();
          }
        };

        // Start playing AI cards after a short delay
        setTimeout(playNextAICard, 800);
      }
    },

    playBonusCard: (card, targetCardId) => {
      const state = get();
      if (!state.player || state.player.supply < card.cost) {
        return;
      }

      // Remove card from hand
      const newHand = state.player.hand.filter(c => c.id !== card.id);
      
      // Draw new card from deck if available
      let newDeck = state.player.deck;
      if (newDeck.length > 0) {
        newHand.push(newDeck[0]);
        newDeck = newDeck.slice(1);
      }

      // Apply bonus effect based on type
      if (card.bonusEffect) {
        const effect = card.bonusEffect;
        
        // Direct damage effects (aerial bombardment, etc)
        if (effect.type === 'direct_building_damage' || effect.type === 'direct_damage') {
          // targetCardId is actually a tower ID for direct attacks
          get().damageTower(targetCardId, effect.value);
        } else {
          // Find target card on board for buff effects
          const targetCard = state.boardCards.find(c => c.id === targetCardId);
          if (!targetCard || targetCard.faction !== state.player.faction) {
            return;
          }

          // Apply buff effects
          const updatedBoardCards = state.boardCards.map(c => {
            if (c.id === targetCardId) {
              if (effect.type === 'heal') {
                return { ...c, currentHealth: Math.min((c.currentHealth || 0) + effect.value, c.health) };
              } else if (effect.type === 'damage_boost') {
                return { ...c, damage: c.damage + effect.value };
              } else if (effect.type === 'building_damage_boost') {
                return { ...c, buildingDamage: c.buildingDamage + effect.value };
              }
            }
            return c;
          });

          set({ boardCards: updatedBoardCards });
        }
      }

      set({
        player: {
          ...state.player,
          hand: newHand,
          deck: newDeck,
          supply: state.player.supply - card.cost
        },
        selectedCard: null
      });
    },

    attackWithCard: (attackerId, targetId) => {
      const state = get();
      if (!state.player || !state.ai || state.currentTurn !== 'player') {
        return;
      }

      const ai = state.ai;
      const player = state.player;

      // Find attacker card
      const attacker = state.boardCards.find(c => c.id === attackerId);
      if (!attacker || attacker.faction !== player.faction || 
          attacker.type !== 'unit' || attacker.hasAttackedThisTurn) {
        return;
      }

      // Determine if target is a tower or card
      const isTowerTarget = targetId.includes('main') || targetId.includes('left') || targetId.includes('right');
      
      if (isTowerTarget) {
        // Attack tower
        const targetTower = ai.towers.find(t => t.id === targetId);
        if (!targetTower || targetTower.health <= 0) {
          return;
        }

        // Validate tower target based on unit class
        const enemyCards = state.boardCards.filter(c => c.faction === ai.faction && c.type === 'unit' && (c.currentHealth || 0) > 0);
        
        if (attacker.unitClass === 'spy') {
          // Spy can only attack main tower
          if (!targetTower.isMain) {
            console.log("Spy units can only attack the main tower");
            return;
          }
        } else {
          // Normal units must attack in priority order
          if (enemyCards.length > 0) {
            console.log("Must defeat enemy units before attacking towers");
            return;
          }
          
          // Check if side towers are still up when attacking main
          if (targetTower.isMain) {
            const sideTowers = ai.towers.filter(t => !t.isMain && t.health > 0);
            if (sideTowers.length > 0) {
              console.log("Must destroy side towers before attacking main tower");
              return;
            }
          }
        }

        // Apply damage to tower
        get().damageTower(targetId, attacker.buildingDamage);
        
      } else {
        // Attack card
        const targetCard = state.boardCards.find(c => c.id === targetId);
        if (!targetCard || targetCard.faction === player.faction || 
            targetCard.type !== 'unit' || (targetCard.currentHealth || 0) <= 0) {
          return;
        }

        // Spy units cannot attack cards (they go straight for main tower)
        if (attacker.unitClass === 'spy') {
          console.log("Spy units attack the main tower directly, not enemy units");
          return;
        }

        // Apply damage to target card
        get().damageCard(targetId, attacker.damage);
        
        // Counter-attack: target deals defense damage back to attacker
        if (targetCard.defense > 0) {
          get().damageCard(attackerId, targetCard.defense);
        }
      }

      // Mark attacker as having attacked this turn - get FRESH state after damage is applied
      const freshState = get();
      const updatedBoardCards = freshState.boardCards.map(c => 
        c.id === attackerId ? { ...c, hasAttackedThisTurn: true } : c
      );
      
      set({ 
        boardCards: updatedBoardCards,
        selectedAttacker: null 
      });
    },

    damageCard: (cardId, damage) => {
      const state = get();
      const updatedCards = state.boardCards.map(card => {
        if (card.id === cardId) {
          const newHealth = Math.max(0, (card.currentHealth || 0) - damage);
          return { ...card, currentHealth: newHealth };
        }
        return card;
      });
      
      // Remove dead cards
      const aliveCards = updatedCards.filter(card => card.type === 'bonus' || (card.currentHealth || 0) > 0);
      set({ boardCards: aliveCards });
    },

    damageTower: (towerId, damage) => {
      const state = get();
      
      // Check player towers
      const updatedPlayerTowers = state.player?.towers.map(tower => {
        if (tower.id === towerId) {
          return { ...tower, health: Math.max(0, tower.health - damage) };
        }
        return tower;
      });

      // Check AI towers
      const updatedAITowers = state.ai?.towers.map(tower => {
        if (tower.id === towerId) {
          return { ...tower, health: Math.max(0, tower.health - damage) };
        }
        return tower;
      });

      set({
        player: state.player ? { ...state.player, towers: updatedPlayerTowers || state.player.towers } : null,
        ai: state.ai ? { ...state.ai, towers: updatedAITowers || state.ai.towers } : null
      });

      // Check win condition
      const playerMainDestroyed = updatedPlayerTowers?.find(t => t.isMain)?.health === 0;
      const aiMainDestroyed = updatedAITowers?.find(t => t.isMain)?.health === 0;

      if (playerMainDestroyed && state.ai) {
        set({ winner: state.ai.faction, gamePhase: 'game_over' });
      } else if (aiMainDestroyed && state.player) {
        set({ winner: state.player.faction, gamePhase: 'game_over' });
      }
    },

    updateBoardCards: (cards) => set({ boardCards: cards }),
    
    updatePlayerTowers: (towers) => {
      const state = get();
      if (state.player) {
        set({ player: { ...state.player, towers } });
      }
    },

    updateAITowers: (towers) => {
      const state = get();
      if (state.ai) {
        set({ ai: { ...state.ai, towers } });
      }
    },

    resetGame: () => set({
      gamePhase: "menu",
      currentTurn: 'player',
      turnNumber: 1,
      player: null,
      ai: null,
      boardCards: [],
      selectedCard: null,
      winner: null
    })
  }))
);
