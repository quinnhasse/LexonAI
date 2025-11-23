/**
 * BackgroundNetworkSphere
 *
 * A subtle 3D spherical network visualization that sits in the background.
 * Renders a sphere of interconnected nodes in the bottom-right corner,
 * with most of the sphere positioned off-screen for a subtle tech aesthetic.
 *
 * Technical Details:
 * - Uses React Three Fiber for 3D rendering
 * - 50 nodes distributed on sphere surface using spherical coordinates
 * - Connects nodes within 1.5 unit distance with thin white lines
 * - Slow continuous Y-axis rotation (0.1 RPM)
 * - Z-index: 1 (behind all UI, including graph visualization)
 * - Pointer events disabled to prevent interaction interference
 */

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Line } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import './BackgroundNetworkSphere.css'

interface NodePosition {
  position: [number, number, number]
}

interface EdgeConnection {
  start: [number, number, number]
  end: [number, number, number]
}

/**
 * Generates nodes distributed evenly on a sphere surface
 * Uses Fibonacci sphere algorithm for uniform distribution
 */
function generateSphereNodes(count: number, radius: number): NodePosition[] {
  const nodes: NodePosition[] = []
  const goldenRatio = (1 + Math.sqrt(5)) / 2
  const angleIncrement = Math.PI * 2 * goldenRatio

  for (let i = 0; i < count; i++) {
    // Fibonacci sphere distribution for even spacing
    const t = i / count
    const inclination = Math.acos(1 - 2 * t)
    const azimuth = angleIncrement * i

    const x = radius * Math.sin(inclination) * Math.cos(azimuth)
    const y = radius * Math.sin(inclination) * Math.sin(azimuth)
    const z = radius * Math.cos(inclination)

    nodes.push({ position: [x, y, z] })
  }

  return nodes
}

/**
 * Generates edges between nearby nodes
 * Connects nodes within maxDistance threshold
 */
function generateEdges(
  nodes: NodePosition[],
  maxDistance: number
): EdgeConnection[] {
  const edges: EdgeConnection[] = []

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const [x1, y1, z1] = nodes[i].position
      const [x2, y2, z2] = nodes[j].position

      const distance = Math.sqrt(
        Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2)
      )

      if (distance <= maxDistance) {
        edges.push({
          start: nodes[i].position,
          end: nodes[j].position,
        })
      }
    }
  }

  return edges
}

/**
 * NetworkSphereScene - The actual 3D scene with rotating nodes and edges
 */
function NetworkSphereScene() {
  const groupRef = useRef<THREE.Group>(null)

  // Generate nodes and edges once on mount
  const { nodes, edges } = useMemo(() => {
    const sphereRadius = 3
    const maxEdgeDistance = 1.5
    const nodeCount = 50

    const generatedNodes = generateSphereNodes(nodeCount, sphereRadius)
    const generatedEdges = generateEdges(generatedNodes, maxEdgeDistance)

    return { nodes: generatedNodes, edges: generatedEdges }
  }, [])

  // Slow continuous rotation with subtle bobbing motion
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime()

      // Rotate at 0.1 RPM (one full rotation per 10 seconds)
      groupRef.current.rotation.y += 0.001

      // Subtle bobbing motion: gentle Y-axis oscillation
      // Frequency: 0.5 (slow bobbing), Amplitude: 0.15 (subtle movement)
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.15

      // Add very subtle X-axis oscillation for more natural movement
      // Phase shifted by PI/2 for figure-8 style motion
      groupRef.current.position.x = Math.cos(time * 0.5) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Render nodes as small white spheres */}
      {nodes.map((node, index) => (
        <Sphere key={`node-${index}`} args={[0.03, 8, 8]} position={node.position}>
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </Sphere>
      ))}

      {/* Render edges as thin white lines */}
      {edges.map((edge, index) => (
        <Line
          key={`edge-${index}`}
          points={[edge.start, edge.end]}
          color="#ffffff"
          lineWidth={1.5}
          transparent
          opacity={0.4}
        />
      ))}
    </group>
  )
}

/**
 * BackgroundNetworkSphere - Main exported component
 * Wraps the scene in a Canvas with proper camera positioning
 */

interface BackgroundNetworkSphereProps {
  hasAskedQuestion?: boolean
}

export default function BackgroundNetworkSphere({
  hasAskedQuestion = false,
}: BackgroundNetworkSphereProps) {
  return (
    <motion.div
      className="background-network-sphere"
      initial={{ x: '100vw', y: 0, opacity: 0 }}
      animate={
        hasAskedQuestion
          ? {
              x: '100vw',
              y: '100vh',
              opacity: 0,
            }
          : {
              x: 0,
              y: 0,
              opacity: 0.6,
            }
      }
      transition={{
        duration: 1.5,
        delay: hasAskedQuestion ? 0 : 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 45,
        }}
        gl={{
          alpha: true,
          antialias: true,
        }}
      >
        <NetworkSphereScene />
      </Canvas>
    </motion.div>
  )
}
