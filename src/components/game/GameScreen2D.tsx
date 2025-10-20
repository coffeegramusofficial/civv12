import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState, Tower } from "../../lib/stores/useGameState";
import { useAudio } from "../../lib/stores/useAudio";
import Tower2D from "./Tower2D";
import Board2D from "./Board2D";
import Card2D from "./Card2D";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

export default function GameScreen2D() {
  const { 
    player, 
    ai,
    boardCards, 
    currentTurn, 
    turnNumber, 
    selectedCard,
    selectedAttacker, 
    selectCard, 
    playCard,
    attackWithCard, 
    endTurn, 
    resetGame,
    winner
  } = useGameState();
  const { playSuccess } = useAudio();
  
  const handleBattlefieldClick = () => {
    if (!selectedCard || selectedCard.type !== 'unit' || !player) return;
    if (currentTurn !== 'player' || player.supply < selectedCard.cost) return;
    
    playCard(selectedCard, { x: Math.random() * 4 - 2, z: -6 });
    
    selectCard(null);
    playSuccess();
  };
  
  const canAttackTower = (tower: Tower): boolean => {
    if (!selectedAttacker || !ai || !player) return false;
    
    const enemyCards = boardCards.filter(c => 
      c.faction === ai.faction && 
      c.type === 'unit' && 
      (c.currentHealth || 0) > 0
    );
    
    if (selectedAttacker.unitClass === 'spy') {
      // Spy can only attack main tower
      return tower.isMain;
    } else {
      // Normal units must clear enemy cards first
      if (enemyCards.length > 0) return false;
      
      // If attacking main tower, side towers must be destroyed first
      if (tower.isMain) {
        const sideTowers = ai.towers.filter(t => !t.isMain && t.health > 0);
        return sideTowers.length === 0;
      }
      
      // Can attack side towers
      return true;
    }
  };
  
  if (!player || !ai) return null;

  if (winner) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md mx-4 bg-black/90 border-amber-600 border-4">
            <CardContent className="p-8 text-center">
              <motion.h2 
                className="text-5xl font-bold text-amber-200 mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {winner === player.faction ? 'VICTORY' : 'DEFEAT'}
              </motion.h2>
              <p className="text-gray-300 mb-6 text-lg">
                The {winner === 'whites' ? 'White Army' : 'Red Army'} has destroyed the enemy's main tower!
              </p>
              <Button 
                onClick={resetGame}
                className="w-full bg-amber-600 hover:bg-amber-700 text-black font-semibold py-6 text-lg"
              >
                Return to Menu
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-auto">
      <div className="min-h-screen py-4 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <Card className="bg-black/60 border-red-400">
              <CardContent className="p-3 flex items-center gap-3">
                <Badge className="bg-red-600 text-white">
                  {ai.faction === 'whites' ? 'White Army' : 'Red Army'} (AI)
                </Badge>
                <div className="text-white flex items-center gap-3">
                  <span className="text-sm">Supply: {ai.supply}</span>
                  <span className="text-sm">Cards: {ai.deck.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/80 border-amber-600">
              <CardContent className="p-4 text-center">
                <div className="text-amber-200 font-semibold text-lg">Turn {turnNumber}</div>
                <div className="text-sm text-gray-300">
                  {currentTurn === 'player' ? 'Your Turn' : 'Enemy Turn'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-blue-400">
              <CardContent className="p-3 flex items-center gap-3">
                <Badge className="bg-blue-600 text-white">
                  {player.faction === 'whites' ? 'White Army' : 'Red Army'} (You)
                </Badge>
                <div className="text-white flex items-center gap-3">
                  <span className="text-sm">Supply: {player.supply}/{player.maxSupply}</span>
                  <span className="text-sm">Cards: {player.deck.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-4">
            {ai.towers.map(tower => {
              const isAttackTarget = !!selectedAttacker && currentTurn === 'player' && tower.health > 0 && canAttackTower(tower);
              return (
                <Tower2D 
                  key={tower.id} 
                  tower={tower}
                  isTargetable={isAttackTarget}
                  onClick={() => {
                    if (isAttackTarget && selectedAttacker) {
                      attackWithCard(selectedAttacker.id, tower.id);
                    }
                  }}
                />
              );
            })}
          </div>

          <Board2D onBattlefieldClick={handleBattlefieldClick} />

          <div className="flex justify-center gap-4">
            {player.towers.map(tower => (
              <Tower2D key={tower.id} tower={tower} />
            ))}
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={endTurn}
              disabled={currentTurn !== 'player'}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-6 text-lg disabled:opacity-50"
            >
              End Turn
            </Button>

            <div className="flex gap-2 justify-center flex-wrap max-w-4xl">
              <AnimatePresence>
                {player.hand.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card2D
                      card={card}
                      isInHand
                      isSelected={selectedCard?.id === card.id}
                      onClick={() => {
                        if (currentTurn === 'player' && player.supply >= card.cost) {
                          selectCard(selectedCard?.id === card.id ? null : card);
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {selectedCard && (
              <Card className="max-w-md bg-black/90 border-yellow-400 border-2">
                <CardContent className="p-4">
                  <h3 className="font-bold text-yellow-400 text-lg mb-2">{selectedCard.name}</h3>
                  <p className="text-sm text-gray-300 mb-2">{selectedCard.description}</p>
                  {selectedCard.type === 'unit' && (
                    <div className="flex gap-4 text-sm text-gray-300 mb-2">
                      <span>ATK: {selectedCard.damage}</span>
                      <span>Tower DMG: {selectedCard.buildingDamage}</span>
                      <span>HP: {selectedCard.health}</span>
                      <span>DEF: {selectedCard.defense}</span>
                    </div>
                  )}
                  <div className="text-sm text-yellow-400">Cost: {selectedCard.cost} Supply</div>
                  <p className="text-xs text-gray-400 mt-2">
                    {selectedCard.type === 'unit' 
                      ? 'Click the battlefield to deploy this unit' 
                      : 'Click a friendly unit to apply bonus'}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {selectedAttacker && (
              <Card className="max-w-md bg-black/90 border-green-400 border-2">
                <CardContent className="p-4">
                  <h3 className="font-bold text-green-400 text-lg mb-2">⚔️ {selectedAttacker.name} Ready to Attack!</h3>
                  <p className="text-sm text-gray-300 mb-2">
                    {selectedAttacker.unitClass === 'spy' 
                      ? 'Click enemy MAIN TOWER to attack directly' 
                      : 'Click enemy unit or tower to attack'}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-300 mb-2">
                    <span>ATK: {selectedAttacker.damage}</span>
                    <span>Tower DMG: {selectedAttacker.buildingDamage}</span>
                    <span>DEF: {selectedAttacker.defense} (counter-attack)</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Click the card again to cancel
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
