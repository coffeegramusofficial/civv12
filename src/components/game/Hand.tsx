import { useGameState } from "../../lib/stores/useGameState";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export default function Hand() {
  const { player, selectedCard, selectCard } = useGameState();

  if (!player) return null;

  const getCardColor = (card: any) => {
    if (card.faction === 'whites') return 'border-blue-400 bg-blue-900/40';
    return 'border-red-400 bg-red-900/40';
  };

  const getCardTypeColor = (type: string) => {
    return type === 'unit' ? 'bg-green-600' : 'bg-purple-600';
  };

  const canAfford = (cost: number) => player.supply >= cost;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="flex gap-2 p-4 bg-black/80 rounded-lg border border-amber-600">
        {player.hand.map((card, index) => (
          <Card 
            key={card.id}
            className={`w-48 cursor-pointer transition-all hover:scale-105 ${
              selectedCard?.id === card.id 
                ? 'ring-2 ring-yellow-400' 
                : getCardColor(card)
            } ${!canAfford(card.cost) ? 'opacity-50' : ''}`}
            onClick={() => selectCard(selectedCard?.id === card.id ? null : card)}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-white text-sm">{card.name}</h4>
                <div className="flex gap-1">
                  <Badge className={getCardTypeColor(card.type)} variant="secondary">
                    {card.type}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-yellow-400 border-yellow-400 ${
                      !canAfford(card.cost) ? 'text-red-400 border-red-400' : ''
                    }`}
                  >
                    {card.cost}💰
                  </Badge>
                </div>
              </div>
              
              {card.type === 'unit' && (
                <div className="flex gap-3 text-xs text-gray-300 mb-2">
                  <span>⚔️ {card.attack}</span>
                  <span>🏰 {card.towerAttack}</span>
                  <span>❤️ {card.health}</span>
                </div>
              )}
              
              <p className="text-xs text-gray-400 mb-1">{card.description}</p>
              
              <div className="text-center mt-2">
                <kbd className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                  {index + 1}
                </kbd>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
