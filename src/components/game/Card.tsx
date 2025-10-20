import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { GameCard } from "../../lib/stores/useGameState";

interface CardProps {
  card: GameCard;
  isInHand?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  isTargetable?: boolean;
}

export default function Card({ card, isInHand = false, onClick, isSelected = false, isTargetable = false }: CardProps) {
  const cardRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const isWhite = card.faction === "whites";
  const cardColor = isWhite ? "#4a90e2" : "#e74c3c";
  const isDead = card.type === 'unit' && (card.health || 0) <= 0;
  
  useFrame(() => {
    if (cardRef.current && !isDead) {
      // Floating animation - flying units float higher
      const baseHeight = isInHand ? 0 : (card.unitClass === 'flying' ? 1.5 : 0.1);
      cardRef.current.position.y = baseHeight + Math.sin(Date.now() * 0.002) * 0.05;
      
      // Selection highlight
      if (isSelected || isTargetable) {
        cardRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.1);
      } else if (hovered) {
        cardRef.current.scale.setScalar(1.05);
      } else {
        cardRef.current.scale.setScalar(1);
      }
    }
  });

  if (!card.position && !isInHand) return null;

  const position = isInHand 
    ? [0, 0, 0] as [number, number, number]
    : [card.position!.x, 0.5, card.position!.z] as [number, number, number];

  return (
    <group 
      ref={cardRef} 
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Card Base */}
      {card.type === 'unit' ? (
        // Unit representation
        <group>
          {/* Unit Body */}
          <mesh castShadow>
            <boxGeometry args={[0.6, 1.2, 0.4]} />
            <meshStandardMaterial 
              color={cardColor}
              opacity={isDead ? 0.3 : 1}
              transparent={isDead}
            />
          </mesh>
          
          {/* Unit Head */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshStandardMaterial 
              color={isWhite ? "#ffd700" : "#8b0000"}
              opacity={isDead ? 0.3 : 1}
              transparent={isDead}
            />
          </mesh>

          {/* Weapon */}
          <mesh position={[0.3, 0.2, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
            <boxGeometry args={[0.1, 0.8, 0.05]} />
            <meshStandardMaterial 
              color="#654321"
              opacity={isDead ? 0.3 : 1}
              transparent={isDead}
            />
          </mesh>
        </group>
      ) : (
        // Bonus card representation
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 8]} />
            <meshStandardMaterial 
              color="#ffff00" 
              emissive="#ffff00" 
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.05, 8]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff" 
              emissiveIntensity={0.1}
            />
          </mesh>
        </group>
      )}

      {/* Card Name */}
      <Text
        position={[0, isInHand ? -0.8 : 1.8, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {card.name}
      </Text>

      {/* Unit Stats */}
      {card.type === 'unit' && (
        <group position={[0, isInHand ? -1.2 : 1.4, 0]}>
          <Text
            position={[-0.6, 0, 0]}
            fontSize={0.12}
            color="#ffff00"
            anchorX="center"
            anchorY="middle"
          >
            ⚔️{card.attack}
          </Text>
          <Text
            position={[0, 0, 0]}
            fontSize={0.12}
            color="#ff6600"
            anchorX="center"
            anchorY="middle"
          >
            🏰{card.towerAttack}
          </Text>
          <Text
            position={[0.6, 0, 0]}
            fontSize={0.12}
            color="#ff0000"
            anchorX="center"
            anchorY="middle"
          >
            ❤️{card.health ?? 0}
          </Text>
        </group>
      )}

      {/* Cost */}
      <Text
        position={[0, isInHand ? -1.6 : 1, 0]}
        fontSize={0.12}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
      >
        💰{card.cost}
      </Text>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1, 16]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Targetable indicator */}
      {isTargetable && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}
