import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState } from "../../lib/stores/useGameState";
import { useAudio } from "../../lib/stores/useAudio";
import { Button } from "../ui/button";
import { Settings } from "lucide-react";

const backgroundImages = [
  "/images/russian_civil_war_19_d128b301.jpg",
  "/images/russian_civil_war_19_d9762813.jpg",
  "/images/russian_civil_war_19_e3b79226.jpg",
  "/images/russian_civil_war_19_dc587496.jpg",
  "/images/russian_civil_war_19_d36a060a.jpg",
];

export default function MainMenu() {
  const { setGamePhase } = useGameState();
  const { backgroundMusic, setBackgroundMusic, isMuted, toggleMute } = useAudio();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!backgroundMusic) {
      const music = new Audio("/sounds/background.mp3");
      music.loop = true;
      music.volume = 0.3;
      setBackgroundMusic(music);
      
      if (!isMuted) {
        music.play().catch(err => console.log("Background music autoplay prevented:", err));
      }
    } else {
      if (isMuted) {
        backgroundMusic.pause();
      } else {
        backgroundMusic.play().catch(err => console.log("Background music play prevented:", err));
      }
    }
  }, [backgroundMusic, setBackgroundMusic, isMuted]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
              filter: 'grayscale(100%) brightness(0.4)'
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-6 right-6 z-20">
        <Button
          onClick={() => setGamePhase('settings')}
          variant="ghost"
          size="icon"
          className="bg-black/40 hover:bg-black/60 text-amber-200 hover:text-amber-100 transition-all"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-16"
        >
          <h1 className="text-6xl font-bold text-amber-100 tracking-wider text-center drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
            1917's Siege
          </h1>
        </motion.div>
        
        <div className="space-y-4 w-96">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              disabled
              className="w-full bg-gradient-to-b from-gray-600 via-gray-700 to-gray-800 text-white/50 font-bold py-5 text-lg border-2 border-gray-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_8px_rgba(0,0,0,0.8)] cursor-not-allowed"
              size="lg"
            >
              Кампания
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button 
              onClick={() => setGamePhase('faction_select')}
              className="w-full bg-gradient-to-b from-red-700 via-red-800 to-red-950 hover:from-red-800 hover:via-red-900 hover:to-black text-white font-bold py-5 text-lg border-2 border-red-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_4px_8px_rgba(0,0,0,0.8)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_6px_12px_rgba(0,0,0,0.9)] transition-all"
              size="lg"
            >
              Быстрый бой
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button 
              disabled
              className="w-full bg-gradient-to-b from-gray-600 via-gray-700 to-gray-800 text-white/50 font-bold py-5 text-lg border-2 border-gray-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_8px_rgba(0,0,0,0.8)] cursor-not-allowed"
              size="lg"
            >
              Сетевая игра
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button 
              onClick={() => setGamePhase('decks')}
              className="w-full bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950 hover:from-blue-900 hover:via-blue-950 hover:to-black text-white font-bold py-5 text-lg border-2 border-blue-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_4px_8px_rgba(0,0,0,0.8)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_6px_12px_rgba(0,0,0,0.9)] transition-all"
              size="lg"
            >
              Колода
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
