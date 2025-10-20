import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Tower as TowerType } from "../../lib/stores/useGameState";
import { Text } from "@react-three/drei";

interface TowerProps {
  tower: TowerType;
}

export default function Tower({ tower }: TowerProps) {
  const towerRef = useRef<THREE.Group>(null);
  const healthBarRef = useRef<THREE.Mesh>(null);
  
  const healthPercentage = tower.health / tower.maxHealth;
  const isWhite = tower.faction === "whites";
  const towerColor = isWhite ? "#4a90e2" : "#e74c3c";
  const healthColor = healthPercentage > 0.5 ? "#00ff00" : healthPercentage > 0.25 ? "#ffff00" : "#ff0000";

  useFrame(() => {
    if (towerRef.current) {
      // Slight bobbing animation for destroyed towers
      if (tower.health <= 0) {
        towerRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.1;
      }
    }
  });

  return (
    <group 
      ref={towerRef} 
      position={[tower.position.x, tower.isMain ? 2 : 1.5, tower.position.z]}
    >
      {/* Tower Base */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.5, 1, 8]} />
        <meshStandardMaterial 
          color={towerColor} 
          opacity={tower.health <= 0 ? 0.3 : 1}
          transparent={tower.health <= 0}
        />
      </mesh>

      {/* Tower Top */}
      <mesh position={[0, tower.isMain ? 0.5 : 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.8, 1.2, tower.isMain ? 1.5 : 1, 8]} />
        <meshStandardMaterial 
          color={towerColor} 
          opacity={tower.health <= 0 ? 0.3 : 1}
          transparent={tower.health <= 0}
        />
      </mesh>

      {/* Tower Details */}
      {tower.isMain && (
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.6, 0.8, 8]} />
          <meshStandardMaterial 
            color={towerColor} 
            opacity={tower.health <= 0 ? 0.3 : 1}
            transparent={tower.health <= 0}
          />
        </mesh>
      )}

      {/* Flag */}
      <mesh position={[0, tower.isMain ? 2.8 : 2.2, 0]}>
        <planeGeometry args={[0.8, 0.5]} />
        <meshStandardMaterial 
          color={isWhite ? "#ffffff" : "#cc0000"} 
          side={THREE.DoubleSide}
          opacity={tower.health <= 0 ? 0.3 : 1}
          transparent={tower.health <= 0}
        />
      </mesh>

      {/* Health Bar Background */}
      <mesh position={[0, tower.isMain ? 3.5 : 3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 0.3]} />
        <meshBasicMaterial color="#333333" transparent opacity={0.8} />
      </mesh>

      {/* Health Bar */}
      <mesh 
        ref={healthBarRef} 
        position={[(-1 + healthPercentage), tower.isMain ? 3.51 : 3.01, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[2 * healthPercentage, 0.25]} />
        <meshBasicMaterial color={healthColor} transparent opacity={0.9} />
      </mesh>

      {/* Health Text */}
      <Text
        position={[0, tower.isMain ? 4 : 3.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {tower.health}/{tower.maxHealth}
      </Text>

      {/* Tower Type Label */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color={towerColor}
        anchorX="center"
        anchorY="middle"
      >
        {tower.isMain ? "MAIN TOWER" : "SIDE TOWER"}
      </Text>
    </group>
  );
}
