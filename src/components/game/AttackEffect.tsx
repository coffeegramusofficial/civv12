import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AttackEffectProps {
  from: { x: number, y: number, z: number };
  to: { x: number, y: number, z: number };
  color: string;
  onComplete: () => void;
}

export default function AttackEffect({ from, to, color, onComplete }: AttackEffectProps) {
  const lineRef = useRef<THREE.Line>(null);
  const progressRef = useRef(0);
  const completedRef = useRef(false);
  const DURATION = 0.3; // seconds

  useFrame((state, delta) => {
    if (completedRef.current) return;
    
    progressRef.current += delta / DURATION;

    if (progressRef.current >= 1) {
      completedRef.current = true;
      onComplete();
      return;
    }

    if (lineRef.current) {
      const opacity = Math.sin(progressRef.current * Math.PI); // Fade in and out
      (lineRef.current.material as THREE.LineBasicMaterial).opacity = opacity;
    }
  });

  const points = [
    new THREE.Vector3(from.x, from.y, from.z),
    new THREE.Vector3(to.x, to.y, to.z)
  ];

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial 
        color={color} 
        transparent 
        opacity={1}
        linewidth={3}
      />
    </line>
  );
}
