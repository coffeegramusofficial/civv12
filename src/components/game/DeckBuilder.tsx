import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGameState } from "../../lib/stores/useGameState";
import { getCardsByFaction, CardData } from "../../lib/cards";
import { saveDeck, getDecksByFaction, loadDeck, deleteDeck, SavedDeck } from "../../lib/deckStorage";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Swords, Castle, Heart, Shield, Trash2 } from "lucide-react";

// Helper function to get card image - unique for each card
const getCardImage = (card: CardData): string => {
  const cardKey = `${card.faction}_${card.name}`;
  
  const imageMap: Record<string, string> = {
    'whites_Юнкер': '/images/whites_yunker.jpg',
    'whites_Пулеметчик «Максим»': '/images/whites_maxim.jpg',
    'whites_Козак': '/images/whites_kozak.jpg',
    'whites_Илья Муромец': '/images/whites_ilya_muromets.jpg',
    'whites_Матрос': '/images/whites_matros.jpg',
    'whites_Разведчик-шпион': '/images/whites_spy.jpg',
    'whites_Доктор Павлов': '/images/whites_doctor_pavlov.jpg',
    'whites_Адмирал Колчак': '/images/whites_admiral_kolchak.jpg',
    'whites_Стенобитное орудие': '/images/whites_siege_weapon.jpg',
    
    'reds_Красноармеец': '/images/reds_krasnoarmeets.jpg',
    'reds_Пулеметчик «Максим»': '/images/reds_maxim.jpg',
    'reds_Офицер ВЧК': '/images/reds_vchk_officer.jpg',
    'reds_Пролетарий': '/images/reds_proletariy.jpg',
    'reds_Рабочий': '/images/reds_rabochiy.jpg',
    'reds_Агент ВЧК': '/images/reds_vchk_agent.jpg',
    'reds_Доктор Маша': '/images/reds_doctor_masha.jpg',
    'reds_Феликс Дзержинский': '/images/reds_felix_dzerzhinsky.jpg',
    'reds_Стенобитное орудие': '/images/reds_siege_weapon.jpg',
  };
  
  return imageMap[cardKey] || '';
};

export default function DeckBuilder() {
  const { setGamePhase, setPlayerDeck } = useGameState();
  const [currentFaction, setCurrentFaction] = useState<'whites' | 'reds'>('whites');
  const [selectedCards, setSelectedCards] = useState<CardData[]>([]);
  const [deckName, setDeckName] = useState("");
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  
  const availableCards = getCardsByFaction(currentFaction);
  const DECK_SIZE = 8;

  useEffect(() => {
    setSavedDecks(getDecksByFaction(currentFaction));
    setSelectedCards([]);
  }, [currentFaction]);

  const addCard = (card: CardData) => {
    // Check if card is already in deck (no duplicates allowed)
    const cardExists = selectedCards.some(c => c.name === card.name);
    if (selectedCards.length < DECK_SIZE && !cardExists) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const removeCard = (index: number) => {
    setSelectedCards(selectedCards.filter((_, i) => i !== index));
  };

  const setAsActiveDeck = () => {
    if (selectedCards.length === DECK_SIZE) {
      saveDeck(`Active_${currentFaction}`, currentFaction, selectedCards);
      setPlayerDeck(selectedCards);
      setSavedDecks(getDecksByFaction(currentFaction));
      alert(`Колода установлена как активная для ${currentFaction === 'whites' ? 'Белой Армии' : 'Красной Армии'}`);
    }
  };

  const loadActiveDeck = (faction: 'whites' | 'reds') => {
    const decks = getDecksByFaction(faction);
    const activeDeck = decks.find(d => d.name === `Active_${faction}`);
    if (activeDeck) {
      const cards = loadDeck(activeDeck.id);
      return cards;
    }
    return null;
  };

  const fillWithRandom = () => {
    const remaining = DECK_SIZE - selectedCards.length;
    const randomCards = [];
    const tempDeck = [...selectedCards];
    
    for (let i = 0; i < remaining; i++) {
      // Filter available cards that are not already in the deck (unique cards only)
      const available = availableCards.filter(card => 
        !tempDeck.some(sc => sc.name === card.name)
      );
      
      if (available.length === 0) {
        // If no unique cards available, break
        break;
      }
      
      const randomCard = available[Math.floor(Math.random() * available.length)];
      randomCards.push(randomCard);
      tempDeck.push(randomCard);
    }
    
    setSelectedCards([...selectedCards, ...randomCards]);
  };

  const handleSaveDeck = () => {
    if (selectedCards.length === DECK_SIZE && deckName.trim()) {
      saveDeck(deckName, currentFaction, selectedCards);
      setSavedDecks(getDecksByFaction(currentFaction));
      setShowSaveDialog(false);
      setDeckName("");
    }
  };

  const handleLoadDeck = (deckId: string) => {
    const cards = loadDeck(deckId);
    if (cards) {
      setSelectedCards(cards);
      setShowLoadDialog(false);
    } else {
      alert("Failed to load deck. Some cards may have been removed or changed.");
    }
  };

  const handleDeleteDeck = (deckId: string) => {
    deleteDeck(deckId);
    setSavedDecks(getDecksByFaction(currentFaction));
  };

  // Visual Card Component
  const VisualCard = ({ card, onClick, isSelected, isInDeck }: { 
    card: CardData; 
    onClick: () => void; 
    isSelected?: boolean;
    isInDeck?: boolean;
  }) => {
    const cardImage = getCardImage(card);
    const borderColor = card.faction === 'whites' ? 'border-blue-400' : 'border-red-400';
    const glowColor = card.faction === 'whites' ? 'shadow-blue-500/50' : 'shadow-red-500/50';

    return (
      <motion.div
        whileHover={{ scale: 1.05, y: -8 }}
        whileTap={{ scale: 0.95 }}
        className={`relative cursor-pointer group ${isInDeck ? 'opacity-40' : ''}`}
        onClick={onClick}
      >
        <div className={`relative w-full aspect-[2/3] rounded-lg overflow-hidden border-2 ${borderColor} bg-black shadow-lg ${isSelected ? `shadow-2xl ${glowColor}` : ''} transition-all`}>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${cardImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
          
          <div className="absolute top-2 right-2 bg-amber-500 text-black font-bold text-lg w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
            {card.cost}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1">
            <div className="text-white font-bold text-sm text-center drop-shadow-lg">
              {card.name}
            </div>
            
            {card.type === 'unit' && (
              <div className="flex justify-center gap-1.5 text-xs flex-wrap">
                <div className="flex items-center gap-0.5 bg-black/70 px-1.5 py-0.5 rounded">
                  <Swords className="h-3 w-3 text-red-400" />
                  <span className="text-white font-semibold">{card.damage}</span>
                </div>
                <div className="flex items-center gap-0.5 bg-black/70 px-1.5 py-0.5 rounded">
                  <Castle className="h-3 w-3 text-orange-400" />
                  <span className="text-white font-semibold">{card.buildingDamage}</span>
                </div>
                <div className="flex items-center gap-0.5 bg-black/70 px-1.5 py-0.5 rounded">
                  <Heart className="h-3 w-3 text-green-400" />
                  <span className="text-white font-semibold">{card.health}</span>
                </div>
                <div className="flex items-center gap-0.5 bg-black/70 px-1.5 py-0.5 rounded">
                  <Shield className="h-3 w-3 text-blue-400" />
                  <span className="text-white font-semibold">{card.defense}</span>
                </div>
              </div>
            )}
          </div>
          
          {isInDeck && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-4xl">✓</div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-4">
            Конструктор колод
          </h1>
          <div className="flex justify-center gap-4 mb-4">
            <Button 
              onClick={() => setCurrentFaction('whites')}
              variant={currentFaction === 'whites' ? 'default' : 'outline'}
              className={currentFaction === 'whites' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-400 text-blue-300 hover:bg-blue-950'}
            >
              Белая Армия
            </Button>
            <Button 
              onClick={() => setCurrentFaction('reds')}
              variant={currentFaction === 'reds' ? 'default' : 'outline'}
              className={currentFaction === 'reds' ? 'bg-red-600 hover:bg-red-700' : 'border-red-400 text-red-300 hover:bg-red-950'}
            >
              Красная Армия
            </Button>
          </div>
          <p className="text-gray-400 text-lg">
            {selectedCards.length}/{DECK_SIZE} карт выбрано
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Cards */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-100">Доступные карты</h2>
            </div>
            <ScrollArea className="h-[600px] pr-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableCards.map((card, index) => {
                  const isAlreadyInDeck = selectedCards.some(c => c.name === card.name);
                  return (
                    <VisualCard 
                      key={`${card.name}-${index}`}
                      card={card}
                      onClick={() => addCard(card)}
                      isInDeck={isAlreadyInDeck}
                    />
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Selected Deck */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-100">Ваша колода</h2>
              <Button 
                onClick={() => setSelectedCards([])}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[600px] pr-4">
              <div className="grid grid-cols-2 gap-3">
                {selectedCards.map((card, index) => (
                  <VisualCard 
                    key={`deck-${card.name}-${index}`}
                    card={card}
                    onClick={() => removeCard(index)}
                    isSelected={true}
                  />
                ))}
                {Array.from({ length: DECK_SIZE - selectedCards.length }).map((_, index) => (
                  <div 
                    key={`empty-${index}`}
                    className="w-full aspect-[2/3] rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/30 flex items-center justify-center text-gray-600"
                  >
                    ?
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-800">
          <Button 
            onClick={() => setGamePhase('menu')}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            ← Назад в меню
          </Button>

          <div className="flex gap-3">
            <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Загрузить
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-gray-100">Сохраненные колоды</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-96">
                  {savedDecks.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">Нет сохраненных колод</p>
                  ) : (
                    <div className="space-y-2">
                      {savedDecks.map(deck => (
                        <div key={deck.id} className="bg-gray-900 border border-gray-700 rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-white">{deck.name}</h4>
                            <p className="text-xs text-gray-500">
                              {new Date(deck.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleLoadDeck(deck.id)}
                              className="bg-gray-700 hover:bg-gray-600"
                            >
                              Загрузить
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteDeck(deck.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  disabled={selectedCards.length !== DECK_SIZE}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Сохранить
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-gray-100">Сохранить колоду</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input 
                    placeholder="Введите название колоды..."
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                  <Button 
                    onClick={handleSaveDeck}
                    disabled={!deckName.trim()}
                    className="w-full bg-gray-700 hover:bg-gray-600"
                  >
                    Сохранить
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={setAsActiveDeck}
              disabled={selectedCards.length !== DECK_SIZE}
              className="bg-green-700 hover:bg-green-600 text-white font-semibold px-6"
            >
              Установить колоду
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
