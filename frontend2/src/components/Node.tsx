import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sphere, Text } from '@react-three/drei'
import { Mesh, Group } from 'three'
import { Node as GraphNode } from '../types'

interface NodeProps {
  node: GraphNode
  isHighlighted: boolean
  onClick: () => void
  animationProgress: number // 0 to 1
}

const nodeTypeConfig = {
  question: {
    color: '#ffffff', // white
    radius: 1.2,
    emissiveIntensity: 0.3,
    emissiveColor: '#e0e0e0', // soft white glow
  },
  answer_root: {
    color: '#ffff00', // yellow
    radius: 2.5,
    emissiveIntensity: 0.5,
    emissiveColor: '#ffff00', // yellow glow
  },
  answer_block: {
    color: '#b0b0b0', // light grey
    radius: 0.8,
    emissiveIntensity: 0.2,
    emissiveColor: '#a0a0a0', // soft grey glow
  },
  direct_source: {
    color: '#808080', // medium grey
    radius: 0.6,
    emissiveIntensity: 0.15,
    emissiveColor: '#707070', // subtle grey glow
  },
  secondary_source: {
    color: '#505050', // dark grey
    radius: 0.4,
    emissiveIntensity: 0.1,
    emissiveColor: '#606060', // very subtle glow
  },
}

export default function Node({ node, isHighlighted, onClick, animationProgress }: NodeProps) {
  const meshRef = useRef<Mesh>(null)
  const wireframeRef = useRef<Mesh>(null)
  const textRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const { camera } = useThree()

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      const t = state.clock.getElapsedTime()
      meshRef.current.position.y += Math.sin(t * 0.5 + (node.position?.[0] || 0)) * 0.001
    }

    // Make text always face camera
    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion)
    }

    // Pulse effect during spawn (first 30% of animation)
    if (wireframeRef.current && animationProgress < 0.3) {
      const pulseIntensity = Math.sin(animationProgress * Math.PI * 10) * 0.15
      wireframeRef.current.scale.setScalar(animationProgress + pulseIntensity + 1)
    }
  })

  const config = nodeTypeConfig[node.type]

  // Animation-based scaling: elastic pop-in effect
  const baseScale = hovered ? 1.2 : isHighlighted ? 1.1 : 1
  const animScale = animationProgress < 1
    ? animationProgress * (1 + (1 - animationProgress) * 0.3) // Overshoot then settle
    : 1
  const scale = baseScale * animScale

  // Truncate label for display
  const getDisplayText = (): string => {
    const label = node.label || 'Node'
    // Truncate long labels
    return label.length > 50 ? label.substring(0, 50) + '...' : label
  }

  return (
    <group position={node.position}>
      {/* Invisible sphere for hit detection */}
      <Sphere
        ref={meshRef}
        args={[config.radius, 16, 16]}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
        scale={scale}
      >
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
      </Sphere>

      {/* Inner solid sphere for fill */}
      <mesh scale={scale}>
        <sphereGeometry args={[config.radius * 0.95, 16, 16]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.0}
          depthWrite
        />
      </mesh>

      {/* Wireframe outline - reduced segments for cleaner look */}
      <mesh ref={wireframeRef} scale={scale} renderOrder={1}>
        <sphereGeometry args={[config.radius, 12, 8]} />
        <meshBasicMaterial
          color="#808080"
          wireframe
          transparent
          opacity={(isHighlighted ? 0.7 : 0.4) * animationProgress}
        />
      </mesh>

      {/* Glow effect during spawn */}
      {animationProgress < 1 && (
        <mesh scale={scale * (1.2 + (1 - animationProgress) * 0.5)}>
          <sphereGeometry args={[config.radius, 12, 8]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={(1 - animationProgress) * 0.4}
            wireframe
          />
        </mesh>
      )}

      {/* Label - billboard (always faces camera) */}
      <group ref={textRef} position={[0, config.radius + 0.5, 0]}>
        <Text
          fontSize={node.type === 'question' || node.type === 'answer_root' ? 0.5 : node.type === 'answer_block' ? 0.35 : 0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
          maxWidth={node.type === 'question' || node.type === 'answer_root' ? 8 : node.type === 'answer_block' ? 5 : 3}
          renderOrder={999}
          fillOpacity={animationProgress}
        >
          {getDisplayText()}
        </Text>
      </group>

    </group>
  )
}
