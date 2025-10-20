import { motion } from "framer-motion";
import { GameCard, useGameState } from "../../lib/stores/useGameState";
import Card2D from "./Card2D";
import { cn } from "../../lib/utils";

interface Board2DProps {
  onBattlefieldClick: () => void;
}

export default function Board2D({ onBattlefieldClick }: Board2DProps) {
  const { boardCards, selectedCard, selectedAttacker, playBonusCard, selectCard, selectAttacker, attackWithCard, player, ai, currentTurn } = useGameState();
  
  const getCardsByFaction = (faction: string) => {
    return boardCards.filter(card => 
      card.faction === faction &&
      (card.currentHealth === undefined || card.currentHealth > 0)
    );
  };
  
  const isPlayerTurn = selectedCard?.type === 'unit';
  const aiCards = getCardsByFaction(player?.faction === "whites" ? "reds" : "whites");
  const playerCards = getCardsByFaction(player?.faction || "whites");
  
  const canAttackTarget = (targetCard: typeof aiCards[0]): boolean => {
    if (!selectedAttacker || !player) return false;
    
    // Spy units cannot attack cards (they go straight for main tower)
    if (selectedAttacker.unitClass === 'spy') return false;
    
    // Normal units can attack enemy cards
    return true;
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="space-y-4">
        {/* Enemy units area */}
        <div 
          className={cn(
            "rounded-lg border-2 border-dashed border-red-500/30 bg-red-950/20 p-4",
            "min-h-[12rem] flex flex-wrap gap-3 justify-center items-center"
          )}
        >
          {aiCards.length > 0 ? (
            aiCards.map(card => {
              const isBonusTarget = selectedCard?.type === 'bonus' && 
                                    card.type === 'unit' && 
                                    card.faction === player?.faction;
              const isAttackTarget = !!selectedAttacker && card.type === 'unit' && currentTurn === 'player' && canAttackTarget(card);
              
              return (
                <Card2D
                  key={card.id}
                  card={card}
                  isTargetable={isBonusTarget || isAttackTarget}
                  onClick={() => {
                    if (isBonusTarget && selectedCard) {
                      playBonusCard(selectedCard, card.id);
                      selectCard(null);
                    } else if (isAttackTarget && selectedAttacker) {
                      attackWithCard(selectedAttacker.id, card.id);
                    }
                  }}
                />
              );
            })
          ) : (
            <div className="text-red-400/50 text-sm">Enemy units will appear here</div>
          )}
        </div>
        
        {/* Central battlefield line */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-amber-600/50"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-900 px-4 text-amber-600 font-bold text-sm tracking-widest">
              FRONT LINE
            </span>
          </div>
        </div>
        
        {/* Player units area */}
        <div 
          className={cn(
            "rounded-lg border-2 border-dashed p-4",
            "min-h-[12rem] flex flex-wrap gap-3 justify-center items-center",
            player?.faction === "whites" ? "border-blue-500/30 bg-blue-950/20" : "border-red-500/30 bg-red-950/20",
            isPlayerTurn && "border-solid border-yellow-400 bg-yellow-950/20 cursor-pointer hover:bg-yellow-950/40"
          )}
          onClick={() => {
            if (isPlayerTurn) {
              onBattlefieldClick();
            }
          }}
        >
          {playerCards.length > 0 ? (
            playerCards.map(card => {
              const isBonusTarget = selectedCard?.type === 'bonus' && 
                                    card.type === 'unit' && 
                                    card.faction === player?.faction;
              const canAttack = card.type === 'unit' && !card.hasAttackedThisTurn && currentTurn === 'player';
              const isSelected = selectedAttacker?.id === card.id;
              
              return (
                <Card2D
                  key={card.id}
                  card={card}
                  isTargetable={isBonusTarget}
                  isSelected={isSelected}
                  className={cn(
                    canAttack && !isSelected && "ring-2 ring-green-400/50",
                    card.hasAttackedThisTurn && "opacity-60"
                  )}
                  onClick={() => {
                    if (isBonusTarget && selectedCard) {
                      playBonusCard(selectedCard, card.id);
                      selectCard(null);
                    } else if (canAttack) {
                      selectAttacker(isSelected ? null : card);
                    }
                  }}
                />
              );
            })
          ) : (
            <div className={cn(
              "text-sm opacity-50",
              player?.faction === "whites" ? "text-blue-400" : "text-red-400"
            )}>
              {isPlayerTurn ? "Click to deploy your units to the front line" : "Your units will appear here"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
