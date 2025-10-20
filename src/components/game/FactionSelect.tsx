import { useGameState } from "../../lib/stores/useGameState";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Faction } from "../../lib/cards";
import { getDecksByFaction, loadDeck } from "../../lib/deckStorage";

export default function FactionSelect() {
  const { setSelectedFaction, setGamePhase, initializeGame, setPlayerDeck } = useGameState();

  const selectFaction = (faction: Faction) => {
    setSelectedFaction(faction);
    
    const decks = getDecksByFaction(faction);
    const activeDeck = decks.find(d => d.name === `Active_${faction}`);
    
    if (activeDeck) {
      const cards = loadDeck(activeDeck.id);
      if (cards) {
        setPlayerDeck(cards);
      }
    }
    
    initializeGame();
    setGamePhase('playing');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-amber-900 to-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center text-amber-200 mb-8">
          Выберите фракцию
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="bg-blue-900/40 border-blue-400 cursor-pointer transition-all hover:scale-105 hover:bg-blue-900/60"
            onClick={() => selectFaction('whites')}
          >
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-blue-200 mb-4">Белая Армия</h2>
                <p className="text-gray-300 mb-6">
                  Имперские лоялисты, сражающиеся за восстановление старого порядка
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full"
                  size="lg"
                >
                  Играть за Белых
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-red-900/40 border-red-400 cursor-pointer transition-all hover:scale-105 hover:bg-red-900/60"
            onClick={() => selectFaction('reds')}
          >
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-red-200 mb-4">Красная Армия</h2>
                <p className="text-gray-300 mb-6">
                  Большевики, борющиеся за новый социалистический порядок
                </p>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold w-full"
                  size="lg"
                >
                  Играть за Красных
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button 
            onClick={() => setGamePhase('menu')}
            variant="outline"
            className="border-gray-500 text-gray-300"
          >
            Назад в меню
          </Button>
        </div>
      </div>
    </div>
  );
}
