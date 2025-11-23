import { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sphere, Text } from '@react-three/drei'
import { Mesh, Group } from 'three'
import { Node as GraphNode, ColorMode } from '../types'
import { colorEngine } from '../utils/colorPalettes'

interface NodeProps {
  node: GraphNode
  isHighlighted: boolean
  onClick: () => void
  animationProgress: number // 0 to 1
  colorMode?: ColorMode
}

const nodeTypeConfig = {
  question: {
    color: '#ffffff', // white
    radius: 1.2,
    emissiveIntensity: 0.3,
    emissiveColor: '#e0e0e0', // soft white glow
  },
  answer_root: {
    color: '#ffffff', // yellow
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
    color: '#b0b0b0', // medium grey
    radius: 0.6,
    emissiveIntensity: 0.15,
    emissiveColor: '#707070', // subtle grey glow
  },
  secondary_source: {
    color: '#b0b0b0', // dark grey
    radius: 0.4,
    emissiveIntensity: 0.1,
    emissiveColor: '#606060', // very subtle glow
  },
}

export default function Node({ node, isHighlighted, onClick, animationProgress, colorMode = 'white' }: NodeProps) {
  const meshRef = useRef<Mesh>(null)
  const wireframeRef = useRef<Mesh>(null)
  const textRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const currentScaleRef = useRef(1) // Track current interpolated scale
  const { camera } = useThree()

  // Target scale based on state
  const targetBaseScale = hovered ? 1.2 : isHighlighted ? 1.1 : 1
  const animScale = animationProgress < 1
    ? animationProgress * (1 + (1 - animationProgress) * 0.3) // Overshoot then settle
    : 1

  // Get color based on color mode
  const baseConfig = nodeTypeConfig[node.type]
  const nodeColor = useMemo(() => {
    if (colorMode === 'white') {
      return baseConfig.color
    }
    return colorEngine.getNodeColor(node, colorMode)
  }, [node, colorMode, baseConfig.color])

  const config = { ...baseConfig, color: nodeColor }

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      const t = state.clock.getElapsedTime()
      meshRef.current.position.y += Math.sin(t * 0.5 + (node.position?.[0] || 0)) * 0.001
    }

    // Smooth scale transition using lerp
    const targetScale = targetBaseScale * animScale
    currentScaleRef.current += (targetScale - currentScaleRef.current) * 0.15

    // Make text always face camera and adjust position based on scale
    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion)

      // Calculate dynamic text offset based on node type and scale
      const baseOffset = node.type === 'answer_root' ? 1.0 : 0.5
      const scaleBasedOffset = node.type === 'answer_root'
        ? (currentScaleRef.current - 1) *  1.1  // Larger offset for answer_root
        : (currentScaleRef.current - 1) * 0.3  // Subtle offset for other nodes

      textRef.current.position.y = config.radius + baseOffset + scaleBasedOffset
    }

    // Pulse effect during spawn (first 30% of animation)
    if (wireframeRef.current && animationProgress < 0.3) {
      const pulseIntensity = Math.sin(animationProgress * Math.PI * 10) * 0.15
      wireframeRef.current.scale.setScalar(animationProgress + pulseIntensity + 1)
    }
  })

  const scale = currentScaleRef.current

  // Get display text - prioritize short labels for better visualization
  const getDisplayText = (): string => {
    // 1. First try shortLabel (1-3 words, ideal for viz)
    if (node.shortLabel) return node.shortLabel

    // 2. Then try displayHeading
    if (node.displayHeading) return node.displayHeading

    // 3. Truncate label to first 3 words if it's long
    if (node.label) {
      const words = node.label.split(' ')
      if (words.length > 3) {
        return words.slice(0, 3).join(' ') + '...'
      }
      return node.label
    }

    // 4. Fallback (should rarely happen)
    return 'Untitled'
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
          opacity={0.72}
        />
      </mesh>

      {/* Wireframe outline - reduced segments for cleaner look */}
      <mesh ref={wireframeRef} scale={scale} renderOrder={1}>
        <sphereGeometry args={[config.radius, 12, 8]} />
        <meshBasicMaterial
          color={nodeColor}
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
            color={nodeColor}
            transparent
            opacity={(1 - animationProgress) * 0.4}
            wireframe
          />
        </mesh>
      )}

      {/* Label - billboard (always faces camera) */}
      <group ref={textRef}>
        <Text
          fontSize={node.type === 'answer_root'
            ? 1.1
            : node.type === 'question'
              ? 0.5
              : node.type === 'answer_block'
                ? 0.35
                : 0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
          maxWidth={node.type === 'question' || node.type === 'answer_root' ? 8 : node.type === 'answer_block' ? 5 : 3}
          renderOrder={999}
          fillOpacity={Math.min(animationProgress * 1.2, 1.0)}
        >
          {getDisplayText()}
        </Text>
      </group>

    </group>
  )
}
