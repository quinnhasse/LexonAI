import { useMemo, useState } from 'react'
import { Line } from '@react-three/drei'
import { Vector3, QuadraticBezierCurve3 } from 'three'
import { useFrame, useThree } from '@react-three/fiber'

interface EdgeProps {
  start: [number, number, number]
  end: [number, number, number]
  isHighlighted: boolean
  isDimmed?: boolean
  animationProgress: number // 0 to 1
  sourceRadius: number
  targetRadius: number
  relation?: 'answers' | 'supports' | 'underpins' | 'semantic_related'
  anyNodeInCameraView: boolean // Whether source and/or target node is visible in camera
}

export default function Edge({ start, end, isHighlighted, isDimmed = false, animationProgress, sourceRadius, targetRadius, relation, anyNodeInCameraView }: EdgeProps) {
  const { camera } = useThree()
  const [dynamicBuffer, setDynamicBuffer] = useState(0.3)
  const [smoothedOpacityMultiplier, setSmoothedOpacityMultiplier] = useState(1.0)

  // Update buffer based on camera distance and smoothly transition opacity
  useFrame((_, delta) => {
    const cameraDistance = camera.position.length()
    // Base buffer at reference distance of 25
    // Scale buffer proportionally with distance
    const newBuffer = 0.3 * (cameraDistance / 25)
    // Clamp between reasonable bounds (minimum 0.3 ensures visible gap even when zoomed in)
    const clampedBuffer = Math.max(0.3, Math.min(0.8, newBuffer))
    setDynamicBuffer(clampedBuffer)

    // Smoothly transition opacity based on camera visibility
    const targetMultiplier = anyNodeInCameraView ? 1.0 : 0.3
    const lerpSpeed = 5.0 // Higher = faster transition
    const newMultiplier = smoothedOpacityMultiplier + (targetMultiplier - smoothedOpacityMultiplier) * Math.min(delta * lerpSpeed, 1.0)
    setSmoothedOpacityMultiplier(newMultiplier)
  })

  // Only "answers" edges (answer_root → blocks) should be straight
  // All other edges (supports, underpins, semantic_related) should be curved
  const isStraightEdge = relation === 'answers'
  const isSemantic = relation === 'semantic_related'

  // Interpolate the end point based on animation progress
  const animatedPoints = useMemo(() => {
    const startVec = new Vector3(...start)
    const endVec = new Vector3(...end)

    // Buffer distance: node radius + dynamic gap
    const startBuffer = sourceRadius + dynamicBuffer
    const endBuffer = targetRadius + dynamicBuffer

    // Calculate direction from start to end for buffering
    const direction = new Vector3().subVectors(endVec, startVec).normalize()

    // Adjust start and end points to create gap
    const adjustedStart = startVec.clone().add(direction.clone().multiplyScalar(startBuffer))
    const adjustedEnd = endVec.clone().sub(direction.clone().multiplyScalar(endBuffer))

    if (isStraightEdge) {
      // For "answers" edges ONLY, use straight radial lines from center to blocks
      // Lerp from adjusted start to adjusted end based on progress
      const currentEnd = adjustedStart.clone().lerp(adjustedEnd, animationProgress)

      return [adjustedStart, currentEnd]
    } else {
      // For ALL other edges (supports, underpins, semantic_related), use curved Bézier curves
      // that wrap around the outside instead of cutting through the center

      // Determine outer radius for control point
      // For semantic edges, push further out; for structural edges, use max node layer radius
      const startRadius = startVec.length()
      const endRadius = endVec.length()
      const maxRadius = Math.max(startRadius, endRadius)
      const controlRadiusMultiplier = isSemantic ? 1.2 : 1.15

      // Calculate control point: midpoint pushed OUTWARD from origin
      const mid = adjustedStart.clone().add(adjustedEnd).multiplyScalar(0.5)
      const midDir = mid.clone().normalize()
      const control = midDir.multiplyScalar(maxRadius * controlRadiusMultiplier)

      // Create quadratic Bézier curve
      const curve = new QuadraticBezierCurve3(adjustedStart, control, adjustedEnd)

      // Sample the curve into points (more points = smoother curve)
      const numPoints = 20
      const curvePoints = curve.getPoints(numPoints)

      // Animate by trimming the curve based on progress
      const visiblePointCount = Math.max(2, Math.floor(curvePoints.length * animationProgress))
      return curvePoints.slice(0, visiblePointCount)
    }
  }, [start, end, animationProgress, sourceRadius, targetRadius, dynamicBuffer, isStraightEdge, isSemantic])

  // Opacity fades in with progress - semantic edges much more subtle
  // If dimmed, make almost invisible
  const baseOpacity = isDimmed ? 0.02 : isHighlighted ? 0.12 : isSemantic ? 0.01 : 0.04

  // Camera-aware opacity: smoothly transition between 30% and 100%
  const opacity = baseOpacity * animationProgress * smoothedOpacityMultiplier

  // Glow effect during drawing - disabled for semantic edges and dimmed edges
  const glowIntensity = (animationProgress < 1 && !isSemantic && !isDimmed) ? (1 - animationProgress) * 0.3 : 0

  return (
    <>
      {/* Main line - semantic edges are thinner */}
      <Line
        points={animatedPoints}
        color={isHighlighted ? '#cccccc' : isSemantic ? '#303030' : '#404040'}
        lineWidth={isHighlighted ? 2 : isSemantic ? 0.5 : 1}
        opacity={opacity}
        transparent
      />

      {/* Glow trail during drawing - not for semantic edges */}
      {glowIntensity > 0 && (
        <Line
          points={animatedPoints}
          color="#ffffff"
          lineWidth={(isHighlighted ? 4 : 3)}
          opacity={glowIntensity}
          transparent
        />
      )}
    </>
  )
}
