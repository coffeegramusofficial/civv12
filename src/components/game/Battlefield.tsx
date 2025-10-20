import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";
import { useAudio } from "../../lib/stores/useAudio";
import Tower from "./Tower";
import Card from "./Card";
import CombatManager from "./CombatManager";

export default function Battlefield() {
  const groundRef = useRef<THREE.Mesh>(null);
  const { player, ai, boardCards, selectedCard, playBonusCard, selectCard } = useGameState();
  const { camera } = useThree();
  const { playSuccess } = useAudio();
  
  // Load battlefield texture
  const grassTexture = useTexture("/textures/grass.png");
  
  useEffect(() => {
    if (grassTexture) {
      grassTexture.wrapS = THREE.RepeatWrapping;
      grassTexture.wrapT = THREE.RepeatWrapping;
      grassTexture.repeat.set(8, 12);
    }
  }, [grassTexture]);

  // Position camera for battlefield view
  useEffect(() => {
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <group>
      {/* Combat Manager */}
      <CombatManager />

      {/* Ground */}
      <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 20]} />
        <meshStandardMaterial 
          map={grassTexture} 
          color="#4a5d23"
        />
      </mesh>

      {/* Battlefield lines */}
      <group>
        {/* Center line */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[12, 0.2]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
        
        {/* Player deployment zone */}
        <mesh position={[0, 0.005, -6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 4]} />
          <meshStandardMaterial color="#0066cc" transparent opacity={0.2} />
        </mesh>
        
        {/* AI deployment zone */}
        <mesh position={[0, 0.005, 6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 4]} />
          <meshStandardMaterial color="#cc0000" transparent opacity={0.2} />
        </mesh>
      </group>

      {/* Player Towers */}
      {player?.towers.map(tower => (
        <Tower key={tower.id} tower={tower} />
      ))}

      {/* AI Towers */}
      {ai?.towers.map(tower => (
        <Tower key={tower.id} tower={tower} />
      ))}

      {/* Board Cards */}
      {boardCards.map(card => {
        const isBonusCardSelected = selectedCard?.type === 'bonus';
        const isTargetable = isBonusCardSelected && 
                           card.type === 'unit' && 
                           card.faction === player?.faction &&
                           (card.health || 0) > 0;
        
        return (
          <Card 
            key={card.id} 
            card={card} 
            isTargetable={isTargetable}
            onClick={() => {
              if (isTargetable && selectedCard) {
                playBonusCard(selectedCard, card.id);
                selectCard(null);
                playSuccess();
              }
            }}
          />
        );
      })}

      {/* Atmospheric elements */}
      <fog attach="fog" args={["#2a1810", 15, 40]} />
    </group>
  );
}
