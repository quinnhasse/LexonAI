import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { KnowledgeNode, Connection, AnswerCore, ViewMode, ClusteringMode } from '../types';

interface ThinkingGlobeProps {
  nodes: KnowledgeNode[];
  connections: Connection[];
  answerCore: AnswerCore | null;
  viewMode: ViewMode;
  clusteringMode: ClusteringMode;
  onNodeClick: (node: KnowledgeNode) => void;
  onNodeHover: (node: KnowledgeNode | null) => void;
}

export function ThinkingGlobe({
  nodes,
  connections,
  answerCore,
  viewMode,
  clusteringMode,
  onNodeClick,
  onNodeHover,
}: ThinkingGlobeProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#050810']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />

        <GlobeScene
          nodes={nodes}
          connections={connections}
          answerCore={answerCore}
          viewMode={viewMode}
          clusteringMode={clusteringMode}
          onNodeClick={onNodeClick}
          onNodeHover={onNodeHover}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
        />
      </Canvas>
    </div>
  );
}

function GlobeScene({
  nodes,
  connections,
  answerCore,
  viewMode,
  clusteringMode,
  onNodeClick,
  onNodeHover,
}: ThinkingGlobeProps) {
  return (
    <>
      <GlobeShell viewMode={viewMode} />
      {answerCore && <AnswerCoreBox answerCore={answerCore} />}
      <NodesLayer
        nodes={nodes}
        clusteringMode={clusteringMode}
        onNodeClick={onNodeClick}
        onNodeHover={onNodeHover}
      />
      <ConnectionsLayer connections={connections} nodes={nodes} />
    </>
  );
}

function GlobeShell({ viewMode }: { viewMode: ViewMode }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.LineSegments>(null);

  useFrame(() => {
    if (meshRef.current && viewMode === 'idle') {
      meshRef.current.rotation.y += 0.001;
    }
    if (gridRef.current && viewMode === 'idle') {
      gridRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      {/* Outer sphere with grid */}
      <Sphere ref={meshRef} args={[5, 32, 32]}>
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.03}
          wireframe={false}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Grid lines */}
      <lineSegments ref={gridRef}>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(5, 2)]} />
        <lineBasicMaterial color="#00d4ff" transparent opacity={0.1} />
      </lineSegments>
    </group>
  );
}

function AnswerCoreBox({ answerCore }: { answerCore: AnswerCore }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[2, 1.5, 0.1]} />
      <meshStandardMaterial
        color="#00d4ff"
        emissive="#00d4ff"
        emissiveIntensity={0.3}
        transparent
        opacity={0.8}
      />
      <Html center distanceFactor={10}>
        <div className="bg-cyber-dark/90 backdrop-blur-md border border-cyber-blue/50 rounded-lg p-4 max-w-md pointer-events-none shadow-xl">
          <div className="text-xs text-cyber-blue/70 mb-2">Answer Core</div>
          <div className="text-sm text-white leading-relaxed">
            {answerCore.text || 'Generating...'}
          </div>
          {answerCore.isGenerating && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-cyber-blue rounded-full animate-pulse" />
              <span className="text-xs text-cyber-blue/70">
                Step {answerCore.currentStep} of {answerCore.totalSteps}
              </span>
            </div>
          )}
        </div>
      </Html>
    </mesh>
  );
}

function NodesLayer({
  nodes,
  clusteringMode,
  onNodeClick,
  onNodeHover,
}: {
  nodes: KnowledgeNode[];
  clusteringMode: ClusteringMode;
  onNodeClick: (node: KnowledgeNode) => void;
  onNodeHover: (node: KnowledgeNode | null) => void;
}) {
  return (
    <group>
      {nodes.map((node) => (
        <KnowledgeNodeMesh
          key={node.id}
          node={node}
          clusteringMode={clusteringMode}
          onClick={() => onNodeClick(node)}
          onPointerOver={() => onNodeHover(node)}
          onPointerOut={() => onNodeHover(null)}
        />
      ))}
    </group>
  );
}

function KnowledgeNodeMesh({
  node,
  clusteringMode,
  onClick,
  onPointerOver,
  onPointerOut,
}: {
  node: KnowledgeNode;
  clusteringMode: ClusteringMode;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = useMemo(() => {
    if (clusteringMode === 'tiers') {
      switch (node.tier) {
        case 1: return '#10b981'; // green
        case 2: return '#00d4ff'; // blue
        default: return '#a855f7'; // purple
      }
    }
    return node.isActive ? '#00d4ff' : '#666666';
  }, [node.tier, node.isActive, clusteringMode]);

  useFrame((state) => {
    if (meshRef.current && node.isActive) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={node.position}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onPointerOver();
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        onPointerOut();
      }}
    >
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={node.isActive ? 0.5 : 0.2}
        transparent
        opacity={node.isActive ? 1 : 0.4}
      />
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-cyber-dark/95 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 pointer-events-none shadow-lg whitespace-nowrap">
            <div className="text-xs text-white font-medium">{node.title}</div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

function ConnectionsLayer({
  connections,
  nodes,
}: {
  connections: Connection[];
  nodes: KnowledgeNode[];
}) {
  const nodeMap = useMemo(() => {
    const map = new Map<string, KnowledgeNode>();
    nodes.forEach(node => map.set(node.id, node));
    return map;
  }, [nodes]);

  return (
    <group>
      {connections.map((connection, index) => {
        const fromNode = nodeMap.get(connection.from);
        const toNode = nodeMap.get(connection.to);

        if (!fromNode || !toNode) return null;

        return (
          <ConnectionLine
            key={`${connection.from}-${connection.to}-${index}`}
            from={fromNode.position}
            to={toNode.position}
            isActive={connection.isActive}
            strength={connection.strength}
          />
        );
      })}
    </group>
  );
}

function ConnectionLine({
  from,
  to,
  isActive,
  strength,
}: {
  from: [number, number, number];
  to: [number, number, number];
  isActive: boolean;
  strength: number;
}) {
  const points = useMemo(() => {
    return [from, to];
  }, [from, to]);

  return (
    <Line
      points={points}
      color={isActive ? '#00d4ff' : '#666666'}
      lineWidth={1}
      transparent
      opacity={isActive ? strength * 0.6 : 0.1}
    />
  );
}
