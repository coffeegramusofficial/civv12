import { GameCard, Tower } from "./stores/useGameState";

export const calculateDistance = (pos1: { x: number, z: number }, pos2: { x: number, z: number }): number => {
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.z - pos2.z, 2));
};

export const findNearestTarget = (card: GameCard, enemies: GameCard[], towers: Tower[]): GameCard | Tower | null => {
  if (!card.position) return null;

  const allTargets = [...enemies, ...towers];
  let nearest: GameCard | Tower | null = null;
  let nearestDistance = Infinity;

  allTargets.forEach(target => {
    const targetPos = 'position' in target ? target.position : target.position;
    if (targetPos) {
      const distance = calculateDistance(card.position!, targetPos);
      if (distance < nearestDistance) {
        nearest = target;
        nearestDistance = distance;
      }
    }
  });

  return nearest;
};

export const isInRange = (attacker: GameCard, target: GameCard | Tower, range: number = 2): boolean => {
  if (!attacker.position) return false;
  
  const targetPos = 'position' in target ? target.position : target.position;
  if (!targetPos) return false;

  return calculateDistance(attacker.position, targetPos) <= range;
};

export const moveTowardsTarget = (card: GameCard, target: { x: number, z: number }, speed: number = 0.1): void => {
  if (!card.position) return;

  const dx = target.x - card.position.x;
  const dz = target.z - card.position.z;
  const distance = Math.sqrt(dx * dx + dz * dz);

  if (distance > speed) {
    card.position.x += (dx / distance) * speed;
    card.position.z += (dz / distance) * speed;
  }
};

export const checkWinCondition = (playerTowers: Tower[], aiTowers: Tower[]): 'player' | 'ai' | null => {
  const playerMainTower = playerTowers.find(t => t.isMain);
  const aiMainTower = aiTowers.find(t => t.isMain);

  if (playerMainTower && playerMainTower.health <= 0) {
    return 'ai';
  }
  if (aiMainTower && aiMainTower.health <= 0) {
    return 'player';
  }

  return null;
};
