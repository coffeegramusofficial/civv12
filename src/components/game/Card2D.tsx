import { motion } from "framer-motion";
import { GameCard } from "../../lib/stores/useGameState";
import { cn } from "../../lib/utils";
import { Swords, Castle, Heart, Shield } from "lucide-react";

interface Card2DProps {
  card: GameCard;
  isInHand?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  isTargetable?: boolean;
  className?: string;
}

const getCardImage = (card: GameCard): string => {
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

export default function Card2D({ 
  card, 
  isInHand = false, 
  onClick, 
  isSelected = false, 
  isTargetable = false,
  className 
}: Card2DProps) {
  const isWhite = card.faction === "whites";
  const borderColor = isWhite ? 'border-blue-400' : 'border-red-400';
  const glowColor = isWhite ? 'shadow-blue-500/50' : 'shadow-red-500/50';
  const isDead = card.type === 'unit' && (card.currentHealth !== undefined ? card.currentHealth : card.health) <= 0;
  const cardImage = getCardImage(card);
  
  return (
    <motion.div
      className={cn(
        "relative w-32 h-44 rounded-lg border-2 cursor-pointer transition-all overflow-hidden bg-black shadow-lg",
        `${borderColor}`,
        isSelected && `ring-4 ring-yellow-400 scale-105 shadow-2xl ${glowColor}`,
        isTargetable && "ring-4 ring-green-400 animate-pulse",
        isDead && "opacity-40 grayscale",
        isInHand && "hover:scale-105 hover:-translate-y-2",
        className
      )}
      onClick={onClick}
      whileHover={!isDead ? { y: isInHand ? -10 : 0, scale: isInHand ? 1.05 : 1 } : {}}
      whileTap={!isDead ? { scale: 0.95 } : {}}
    >
      {cardImage && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${cardImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
        </>
      )}
      
      <div className="absolute top-2 right-2 bg-amber-500 text-black font-bold text-sm w-7 h-7 rounded-full flex items-center justify-center shadow-lg z-10">
        {card.cost}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1">
        <div className="text-white font-bold text-xs text-center drop-shadow-lg truncate">
          {card.name}
        </div>
        
        {card.type === 'unit' && (
          <div className="flex justify-center gap-1 text-[10px] flex-wrap">
            <div className="flex items-center gap-0.5 bg-black/70 px-1 py-0.5 rounded">
              <Swords className="h-2.5 w-2.5 text-red-400" />
              <span className="text-white font-semibold">{card.damage}</span>
            </div>
            <div className="flex items-center gap-0.5 bg-black/70 px-1 py-0.5 rounded">
              <Castle className="h-2.5 w-2.5 text-orange-400" />
              <span className="text-white font-semibold">{card.buildingDamage}</span>
            </div>
            <div className="flex items-center gap-0.5 bg-black/70 px-1 py-0.5 rounded">
              <Heart className="h-2.5 w-2.5 text-green-400" />
              <span className="text-white font-semibold">
                {card.currentHealth !== undefined ? card.currentHealth : card.health}
              </span>
            </div>
            <div className="flex items-center gap-0.5 bg-black/70 px-1 py-0.5 rounded">
              <Shield className="h-2.5 w-2.5 text-blue-400" />
              <span className="text-white font-semibold">{card.defense}</span>
            </div>
          </div>
        )}
        
        {card.type === 'bonus' && card.bonusEffect && (
          <div className="text-[10px] text-yellow-300 font-semibold text-center bg-black/70 px-1 py-0.5 rounded">
            {card.bonusEffect.type === 'heal' && `+${card.bonusEffect.value} HP`}
            {card.bonusEffect.type === 'damage_boost' && `+${card.bonusEffect.value} ATK`}
            {card.bonusEffect.type === 'building_damage_boost' && `+${card.bonusEffect.value} TWR`}
            {card.bonusEffect.type === 'direct_building_damage' && `${card.bonusEffect.value} DMG`}
            {card.bonusEffect.type === 'direct_damage' && `${card.bonusEffect.value} DMG`}
          </div>
        )}
      </div>
      
      {card.unitClass && (
        <div className="absolute top-2 left-2">
          <span className={cn(
            "text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg",
            card.unitClass === 'spy' && "bg-purple-700 text-white",
            card.unitClass === 'assault' && "bg-red-700 text-white",
            card.unitClass === 'support' && "bg-green-700 text-white"
          )}>
            {card.unitClass === 'assault' && 'ШТМ'}
            {card.unitClass === 'support' && 'ПДД'}
            {card.unitClass === 'spy' && 'ШПН'}
          </span>
        </div>
      )}
      
      {card.bonusClass === 'aerial' && (
        <div className="absolute top-2 left-2">
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg bg-sky-600 text-white">
            АВА
          </span>
        </div>
      )}
    </motion.div>
  );
}
