import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useState } from "react";
import { useGameState } from "../../lib/stores/useGameState";
import { useAudio } from "../../lib/stores/useAudio";
import Hand from "./Hand";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

enum Controls {
  select = 'select',
  cancel = 'cancel',
  card1 = 'card1',
  card2 = 'card2',
  card3 = 'card3',
  card4 = 'card4',
}

export default function GameUI() {
  const [subscribe] = useKeyboardControls<Controls>();
  const { 
    player, 
    ai, 
    currentTurn, 
    turnNumber, 
    selectedCard, 
    selectCard, 
    playCard, 
    playBonusCard,
    boardCards,
    endTurn, 
    resetGame,
    gamePhase,
    winner
  } = useGameState();
  const { playSuccess, playHit } = useAudio();
  const [deployPosition, setDeployPosition] = useState<{x: number, z: number} | null>(null);
  const [awaitingBonusTarget, setAwaitingBonusTarget] = useState(false);

  // Keyboard controls
  useEffect(() => {
    const unsubs = [
      subscribe((state) => state.card1, (pressed) => {
        if (pressed && player?.hand[0]) {
          selectCard(player.hand[0]);
        }
      }),
      subscribe((state) => state.card2, (pressed) => {
        if (pressed && player?.hand[1]) {
          selectCard(player.hand[1]);
        }
      }),
      subscribe((state) => state.card3, (pressed) => {
        if (pressed && player?.hand[2]) {
          selectCard(player.hand[2]);
        }
      }),
      subscribe((state) => state.card4, (pressed) => {
        if (pressed && player?.hand[3]) {
          selectCard(player.hand[3]);
        }
      }),
      subscribe((state) => state.cancel, (pressed) => {
        if (pressed) {
          selectCard(null);
        }
      })
    ];

    return () => unsubs.forEach(unsub => unsub());
  }, [subscribe, player, selectCard]);

  // Handle bonus card selection
  useEffect(() => {
    if (selectedCard?.type === 'bonus') {
      setAwaitingBonusTarget(true);
    } else {
      setAwaitingBonusTarget(false);
    }
  }, [selectedCard]);

  // Handle card deployment on battlefield click
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!selectedCard) return;

      // Bonus cards can be played anytime (not restricted to player turn)
      if (selectedCard.type === 'bonus') {
        // This will be handled by clicking on units directly
        return;
      }

      // Unit cards require player turn
      if (currentTurn !== 'player') return;

      // Convert screen coordinates to world coordinates (simplified)
      const rect = (event.target as HTMLElement)?.getBoundingClientRect();
      if (rect) {
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
        const z = -((event.clientY - rect.top) / rect.height - 0.5) * 20;
        
        // Check if position is in player deployment zone (bottom half)
        if (z >= -8 && z <= 2) {
          playCard(selectedCard, { x: Math.max(-6, Math.min(6, x)), z });
          playSuccess();
        }
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [selectedCard, currentTurn, playCard, playSuccess]);

  if (!player || !ai) return null;

  if (winner) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 bg-black/90 border-amber-600">
          <CardContent className="p-6 text-center">
            <h2 className="text-3xl font-bold text-amber-200 mb-4">
              {winner === player.faction ? 'Victory!' : 'Defeat!'}
            </h2>
            <p className="text-gray-300 mb-6">
              The {winner === 'whites' ? 'White Army' : 'Red Army'} has destroyed the enemy's main tower!
            </p>
            <div className="space-y-2">
              <Button 
                onClick={resetGame}
                className="w-full bg-amber-600 hover:bg-amber-700 text-black font-semibold"
              >
                Return to Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Top UI */}
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-auto">
        {/* Player Info */}
        <Card className="bg-black/80 border-blue-400">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-600">
                {player.faction === 'whites' ? 'White Army' : 'Red Army'}
              </Badge>
              <div className="text-white">
                <div className="flex items-center gap-2">
                  <span>💰 {player.supply}/{player.maxSupply}</span>
                  <span>📚 {player.deck.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Turn Info */}
        <Card className="bg-black/80 border-amber-600">
          <CardContent className="p-3">
            <div className="text-center text-amber-200">
              <div className="font-semibold">Turn {turnNumber}</div>
              <div className="text-sm">
                {currentTurn === 'player' ? 'Your Turn' : 'Enemy Turn'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Info */}
        <Card className="bg-black/80 border-red-400">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-red-600">
                {ai.faction === 'whites' ? 'White Army' : 'Red Army'}
              </Badge>
              <div className="text-white">
                <div className="flex items-center gap-2">
                  <span>💰 {ai.supply}</span>
                  <span>📚 {ai.deck.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* End Turn Button */}
      <div className="absolute top-4 right-1/2 transform translate-x-1/2 pointer-events-auto">
        <Button
          onClick={endTurn}
          disabled={currentTurn !== 'player'}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          End Turn
        </Button>
      </div>

      {/* Selected Card Info */}
      {selectedCard && (
        <div className="absolute top-20 right-4 pointer-events-auto">
          <Card className="w-64 bg-black/90 border-yellow-400">
            <CardContent className="p-4">
              <h3 className="font-bold text-yellow-400 mb-2">{selectedCard.name}</h3>
              <p className="text-sm text-gray-300 mb-2">{selectedCard.description}</p>
              
              {selectedCard.type === 'unit' && (
                <div className="flex gap-4 text-sm text-gray-300 mb-3">
                  <span>⚔️ Attack: {selectedCard.damage}</span>
                  <span>🏰 Tower: {selectedCard.buildingDamage}</span>
                  <span>❤️ Health: {selectedCard.health}</span>
                </div>
              )}
              
              <div className="text-sm text-yellow-400">
                💰 Cost: {selectedCard.cost} supply
              </div>
              
              <p className="text-xs text-gray-400 mt-2">
                Click on the battlefield to deploy
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Player Hand */}
      <Hand />

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <Card className="bg-black/60 border-gray-600">
          <CardContent className="p-2">
            <div className="text-xs text-gray-400 space-y-1">
              <div>Press 1-4 to select cards</div>
              <div>Click battlefield to deploy</div>
              <div>ESC to deselect card</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
