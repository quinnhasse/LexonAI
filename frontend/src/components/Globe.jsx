import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { NODE_TYPES, NODE_STATES, COLORS, CLUSTER_TIERS } from '../utils/constants';

// Node component
function Node({ node, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Get color based on node type and state
  const getNodeColor = () => {
    if (node.state === NODE_STATES.THINKING) return COLORS.neonPurple;
    if (node.state === NODE_STATES.ACTIVE) return COLORS.neonCyan;
    if (node.state === NODE_STATES.COMPLETE) return COLORS.neonGreen;

    switch (node.type) {
      case NODE_TYPES.ANSWER_CORE:
        return COLORS.neonCyan;
      case NODE_TYPES.GENERATING:
        return COLORS.neonPurple;
      case NODE_TYPES.SOURCE:
        return COLORS.neonGreen;
      default:
        return COLORS.neonCyan;
    }
  };

  // Get size based on node type and tier
  const getNodeSize = () => {
    if (node.type === NODE_TYPES.ANSWER_CORE) return 0.6;
    if (node.tier === 'primary') return CLUSTER_TIERS.PRIMARY.size * 0.4;
    if (node.tier === 'secondary') return CLUSTER_TIERS.SECONDARY.size * 0.35;
    if (node.tier === 'tertiary') return CLUSTER_TIERS.TERTIARY.size * 0.3;
    return 0.4;
  };

  const color = getNodeColor();
  const size = getNodeSize();

  // Animate nodes
  useFrame((state) => {
    if (meshRef.current) {
      // Pulse animation for thinking state
      if (node.state === NODE_STATES.THINKING || node.state === NODE_STATES.ACTIVE) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }

      // Gentle floating animation
      if (node.type !== NODE_TYPES.ANSWER_CORE) {
        const float = Math.sin(state.clock.elapsedTime + node.position.x) * 0.05;
        meshRef.current.position.y = node.position.y + float;
      }

      // Hover effect
      if (hovered && node.state !== NODE_STATES.THINKING) {
        meshRef.current.scale.setScalar(1.2);
      }
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[node.position.x, node.position.y, node.position.z]}
        onClick={() => onClick && onClick(node)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>

      {/* Outer glow */}
      <mesh position={[node.position.x, node.position.y, node.position.z]}>
        <sphereGeometry args={[size * 1.3, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Label */}
      <Html
        position={[node.position.x, node.position.y + size + 0.5, node.position.z]}
        center
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          className="px-3 py-1.5 rounded-lg glass-strong border border-white/20 whitespace-nowrap"
          style={{
            backgroundColor: 'rgba(10, 10, 15, 0.9)',
          }}
        >
          <p
            className="text-sm font-medium glow-cyan-text"
            style={{
              color: '#ffffff',
              textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            {node.label}
          </p>
        </div>
      </Html>
    </group>
  );
}

// Connection lines between nodes
function ConnectionLine({ start, end, color = COLORS.neonCyan }) {
  const points = useMemo(() => {
    return [
      new THREE.Vector3(start.x, start.y, start.z),
      new THREE.Vector3(end.x, end.y, end.z),
    ];
  }, [start, end]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
}

// Main scene component
function Scene({ nodes, onNodeClick }) {
  const groupRef = useRef();

  // Auto-rotate the scene gently
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  // Generate connections from answer core to other nodes
  const connections = useMemo(() => {
    const answerCore = nodes.find((n) => n.type === NODE_TYPES.ANSWER_CORE);
    if (!answerCore) return [];

    return nodes
      .filter((n) => n.id !== 'answer-core')
      .map((node) => ({
        start: answerCore.position,
        end: node.position,
        color:
          node.state === NODE_STATES.ACTIVE
            ? COLORS.neonCyan
            : node.state === NODE_STATES.THINKING
            ? COLORS.neonPurple
            : COLORS.neonGreen,
      }));
  }, [nodes]);

  return (
    <group ref={groupRef}>
      {/* Render connections */}
      {connections.map((conn, i) => (
        <ConnectionLine key={`conn-${i}`} start={conn.start} end={conn.end} color={conn.color} />
      ))}

      {/* Render nodes */}
      {nodes.map((node) => (
        <Node key={node.id} node={node} onClick={onNodeClick} />
      ))}

      {/* Ambient particles */}
      <Points />
    </group>
  );
}

// Background particles
function Points() {
  const pointsRef = useRef();
  const particleCount = 500;

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30;
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={COLORS.neonCyan}
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
}

// Main Globe component
export default function Globe({ nodes, onNodeClick }) {
  return (
    <div className="w-full h-full relative">
      {/* Gradient background overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/3 gradient-radial-purple opacity-30" />
        <div className="absolute bottom-0 right-0 w-full h-1/3 gradient-radial-cyan opacity-30" />
      </div>

      {/* Canvas */}
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color={COLORS.neonCyan} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color={COLORS.neonPurple} />

        {/* Scene */}
        <Scene nodes={nodes} onNodeClick={onNodeClick} />

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={5}
          maxDistance={20}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 glass px-4 py-2 rounded-full border border-white/10">
        <p className="text-xs text-white/50">
          Click and drag to rotate • Scroll to zoom
        </p>
      </div>
    </div>
  );
}
