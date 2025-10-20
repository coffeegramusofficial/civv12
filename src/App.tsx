import { useEffect, useState } from "react";
import { useGameState } from "./lib/stores/useGameState";
import "@fontsource/inter";

import MainMenu from "./components/game/MainMenu";
import DeckBuilder from "./components/game/DeckBuilder";
import FactionSelect from "./components/game/FactionSelect";
import Settings from "./components/game/Settings";
import GameScreen2D from "./components/game/GameScreen2D";

function App() {
  const { gamePhase } = useGameState();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {showContent && (
        <>
          {gamePhase === 'menu' && <MainMenu />}
          {gamePhase === 'decks' && <DeckBuilder />}
          {gamePhase === 'faction_select' && <FactionSelect />}
          {gamePhase === 'settings' && <Settings />}
          {(gamePhase === 'playing' || gamePhase === 'game_over') && <GameScreen2D />}
        </>
      )}
    </div>
  );
}

export default App;
