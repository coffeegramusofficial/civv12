import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameState } from "../../lib/stores/useGameState";
import { findNearestTarget, isInRange, moveTowardsTarget } from "../../lib/gameLogic";
import { useAudio } from "../../lib/stores/useAudio";
import AttackEffect from "./AttackEffect";

interface AttackEffectData {
  id: string;
  from: { x: number, y: number, z: number };
  to: { x: number, y: number, z: number };
  color: string;
}

export default function CombatManager() {
  const { 
    boardCards, 
    player, 
    ai, 
    damageCard, 
    damageTower,
    updateBoardCards,
    currentTurn 
  } = useGameState();
  const { playHit } = useAudio();
  const lastAttackTime = useRef<Map<string, number>>(new Map());
  const ATTACK_COOLDOWN = 1000; // 1 second between attacks
  const [attackEffects, setAttackEffects] = useState<AttackEffectData[]>([]);

  useFrame(() => {
    if (!player || !ai || boardCards.length === 0) return;

    const now = Date.now();
    const updatedCards = [...boardCards];
    let cardsChanged = false;

    // Process each unit card on the battlefield
    boardCards.forEach((card, index) => {
      if (card.type === 'bonus' || !card.position) return;

      const isPlayerCard = card.faction === player.faction;
      const enemyCards = boardCards.filter(c => 
        c.faction !== card.faction && c.type === 'unit' && c.position && (c.currentHealth || 0) > 0
      );
      const enemyTowers = isPlayerCard ? ai.towers : player.towers;

      // Spy class can attack main tower directly
      const canAttackMainDirectly = card.unitClass === 'spy';
      
      // Find nearest target based on priority:
      // 1. Enemy units (if present and not spy)
      // 2. Side towers (if present)
      // 3. Main tower
      let target;
      if (canAttackMainDirectly) {
        // Spy can attack main tower directly
        const mainTower = enemyTowers.find(t => t.isMain);
        target = mainTower || findNearestTarget(card, [], enemyTowers);
      } else if (enemyCards.length > 0) {
        // Attack enemy units first
        target = findNearestTarget(card, enemyCards, []);
      } else {
        // No enemy units, attack towers (side towers first, then main)
        const sideTowers = enemyTowers.filter(t => !t.isMain && t.health > 0);
        if (sideTowers.length > 0) {
          target = findNearestTarget(card, [], sideTowers);
        } else {
          target = findNearestTarget(card, [], enemyTowers);
        }
      }
      
      if (!target) return;

      // Check if in range to attack
      if (isInRange(card, target, 2)) {
        // Attack if cooldown has passed
        const lastAttack = lastAttackTime.current.get(card.id) || 0;
        if (now - lastAttack >= ATTACK_COOLDOWN) {
          lastAttackTime.current.set(card.id, now);
          
          // Determine damage type
          const damage = 'isMain' in target ? card.buildingDamage : card.damage;
          
          // Create attack effect
          const targetPos = 'position' in target ? target.position : target.position;
          if (targetPos) {
            const attackColor = card.faction === 'whites' ? '#4a90e2' : '#e74c3c';
            setAttackEffects(prev => [...prev, {
              id: `attack_${Date.now()}_${Math.random()}`,
              from: { x: card.position!.x, y: 0.5, z: card.position!.z },
              to: { x: targetPos.x, y: 0.5, z: targetPos.z },
              color: attackColor
            }]);
          }
          
          // Deal damage
          if ('isMain' in target) {
            damageTower(target.id, damage);
          } else {
            damageCard(target.id, damage);
          }
          
          playHit();
          
          console.log(`${card.name} attacks ${('isMain' in target ? target.id : target.name)} for ${damage} damage`);
        }
      } else {
        // Move towards target
        const targetPos = 'position' in target ? target.position : target.position;
        if (targetPos && card.position) {
          moveTowardsTarget(card, targetPos, 0.05);
          updatedCards[index] = { ...card };
          cardsChanged = true;
        }
      }
    });

    // Update positions if any cards moved
    if (cardsChanged) {
      updateBoardCards(updatedCards);
    }
  });

  const handleEffectComplete = (id: string) => {
    setAttackEffects(prev => prev.filter(effect => effect.id !== id));
  };

  return (
    <>
      {attackEffects.map(effect => (
        <AttackEffect
          key={effect.id}
          from={effect.from}
          to={effect.to}
          color={effect.color}
          onComplete={() => handleEffectComplete(effect.id)}
        />
      ))}
    </>
  );
}
