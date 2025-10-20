import { motion } from "framer-motion";
import { Tower } from "../../lib/stores/useGameState";
import { cn } from "../../lib/utils";

interface Tower2DProps {
  tower: Tower;
  onClick?: () => void;
  isTargetable?: boolean;
}

export default function Tower2D({ tower, onClick, isTargetable = false }: Tower2DProps) {
  const healthPercentage = (tower.health / tower.maxHealth) * 100;
  const isWhite = tower.faction === "whites";
  const factionColor = isWhite ? "blue" : "red";
  const isDestroyed = tower.health <= 0;
  
  const getHealthColor = () => {
    if (healthPercentage > 60) return "bg-green-500";
    if (healthPercentage > 30) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <motion.div
      className={cn(
        "relative w-32 h-40 rounded-lg border-2 cursor-pointer transition-all",
        isWhite ? "border-blue-500 bg-gradient-to-br from-blue-800 to-blue-950" : "border-red-500 bg-gradient-to-br from-red-800 to-red-950",
        tower.isMain && "border-4 shadow-2xl",
        isTargetable && "ring-4 ring-yellow-400 animate-pulse",
        isDestroyed && "opacity-40 grayscale"
      )}
      onClick={onClick}
      whileHover={!isDestroyed ? { scale: 1.05 } : {}}
      whileTap={!isDestroyed ? { scale: 0.95 } : {}}
    >
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-300 font-semibold">
        {tower.isMain ? "MAIN" : "SIDE"}
      </div>
      
      <div className="h-24 flex items-center justify-center">
        <div className={cn(
          "px-4 py-2 rounded font-bold text-lg",
          tower.isMain ? "bg-amber-600 text-black" : "bg-gray-700 text-gray-200"
        )}>
          {tower.isMain ? 'HQ' : 'TOWER'}
        </div>
      </div>
      
      <div className="absolute bottom-8 left-2 right-2">
        <div className="bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-600">
          <motion.div
            className={cn("h-full transition-all", getHealthColor())}
            initial={{ width: `${healthPercentage}%` }}
            animate={{ width: `${healthPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">
        {tower.health}/{tower.maxHealth}
      </div>
      
      {isDestroyed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
          <span className="text-red-500 text-2xl font-bold">DESTROYED</span>
        </div>
      )}
    </motion.div>
  );
}
