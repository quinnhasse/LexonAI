import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Edge, GraphNode } from '../types'
import { findLeafNodes, calculatePathsFromLeafNodes } from '../utils/graphUtils'
import { getNodeRadius } from '../utils/nodeVisuals'

const vertexShader = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (250.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  uniform sampler2D pointTexture;
  varying vec3 vColor;
  void main() {
    vec4 texColor = texture2D(pointTexture, gl_PointCoord);
    float alpha = texColor.a;
    gl_FragColor = vec4(vColor * 1.15, alpha);
  }
`

interface PathPolyline {
  points: THREE.Vector3[]
  cumulative: number[]
  length: number
}

interface EdgePath {
  reverse: PathPolyline // target -> source (leaf toward core)
}

interface Particle {
  id: number
  position: THREE.Vector3
  path: PathPolyline[]
  edgeIndex: number
  distanceAlongEdge: number
  speed: number
  size: number
  color: THREE.Color
  life: number
  maxLife: number
  alive: boolean
}

interface ParticleSystemProps {
  nodes: GraphNode[]
  edges: Edge[]
  particlePulseTrigger: number
}

const STRUCTURAL_RELATIONS: Edge['relation'][] = ['answers', 'supports', 'underpins']
const MAX_PARTICLES = 240
const MIN_PARTICLES_PER_PULSE = 3
const MAX_PARTICLES_PER_PULSE = 7
const MIN_SPEED = 8 // units per second
const MAX_SPEED = 16
const MIN_SIZE = 1.2
const MAX_SIZE = 2.4
const EDGE_GAP = 0.35
const GLOW_RADIUS_FACTOR = 1.8
const MAX_LIFETIME_SECONDS = 14
const PARTICLE_COLORS = [
  new THREE.Color(0xfff4d4),
  new THREE.Color(0x7cf5ff),
  new THREE.Color(0xffffff),
]
const GLOW_COLOR = new THREE.Color(0xffffd1)

const generateGlowTexture = () => {
  const size = 64
  const data = new Uint8Array(size * size * 4)
  const center = size / 2
  const maxDistance = Math.sqrt(2 * center * center)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center
      const dy = y - center
      const distance = Math.sqrt(dx * dx + dy * dy)
      const falloff = 1 - distance / maxDistance
      const intensity = Math.max(0, Math.pow(falloff, 1.5))
      const i = (y * size + x) * 4
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = Math.floor(255 * intensity)
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.needsUpdate = true
  return texture
}

const buildPolyline = (points: THREE.Vector3[]): PathPolyline => {
  const cumulative: number[] = [0]
  for (let i = 1; i < points.length; i++) {
    const dist = points[i].distanceTo(points[i - 1])
    cumulative.push(cumulative[i - 1] + dist)
  }
  return {
    points,
    cumulative,
    length: cumulative[cumulative.length - 1] || 0,
  }
}

const buildEdgePath = (
  edge: Edge,
  nodeLookup: Map<string, GraphNode>
): EdgePath | null => {
  const sourceId = edge.from || edge.source
  const targetId = edge.to || edge.target
  if (!sourceId || !targetId) return null

  const sourceNode = nodeLookup.get(sourceId)
  const targetNode = nodeLookup.get(targetId)
  if (!sourceNode?.position || !targetNode?.position) return null

  const startVec = new THREE.Vector3(...sourceNode.position)
  const endVec = new THREE.Vector3(...targetNode.position)

  const direction = new THREE.Vector3().subVectors(endVec, startVec).normalize()
  const startBuffer = getNodeRadius(sourceNode.type) + EDGE_GAP
  const endBuffer = getNodeRadius(targetNode.type) + EDGE_GAP

  const adjustedStart = startVec.clone().add(direction.clone().multiplyScalar(startBuffer))
  const adjustedEnd = endVec.clone().sub(direction.clone().multiplyScalar(endBuffer))

  let sampledPoints: THREE.Vector3[]

  if (edge.relation === 'answers') {
    sampledPoints = [adjustedStart, adjustedEnd]
  } else {
    const startRadius = startVec.length()
    const endRadius = endVec.length()
    const maxRadius = Math.max(startRadius, endRadius)
    const controlMultiplier = edge.relation === 'semantic_related' ? 1.18 : 1.12
    const midpoint = adjustedStart.clone().add(adjustedEnd).multiplyScalar(0.5)
    const control = midpoint.clone().normalize().multiplyScalar(maxRadius * controlMultiplier)
    const curve = new THREE.QuadraticBezierCurve3(adjustedStart, control, adjustedEnd)
    sampledPoints = curve.getPoints(40)
  }

  const reversePolyline = buildPolyline([...sampledPoints].reverse())
  return { reverse: reversePolyline }
}

const getPointAlongPolyline = (polyline: PathPolyline, distance: number): THREE.Vector3 => {
  if (polyline.length <= 0) return polyline.points[polyline.points.length - 1].clone()
  if (distance <= 0) return polyline.points[0].clone()
  if (distance >= polyline.length) return polyline.points[polyline.points.length - 1].clone()

  let segmentIndex = 0
  while (segmentIndex < polyline.cumulative.length - 1 && polyline.cumulative[segmentIndex + 1] < distance) {
    segmentIndex++
  }

  const startDistance = polyline.cumulative[segmentIndex]
  const endDistance = polyline.cumulative[segmentIndex + 1]
  const t = (distance - startDistance) / (endDistance - startDistance || 1)
  return polyline.points[segmentIndex].clone().lerp(polyline.points[segmentIndex + 1], t)
}

export function ParticleSystem({ nodes, edges, particlePulseTrigger }: ParticleSystemProps) {
  const particlesRef = useRef<THREE.Points>(null)
  const glowParticlesRef = useRef<THREE.Points>(null)
  const activeParticles = useRef<Particle[]>([])
  const particleIdCounter = useRef(0)

  const nodeLookup = useMemo(() => {
    const map = new Map<string, GraphNode>()
    nodes.forEach(n => map.set(n.id, n))
    return map
  }, [nodes])

  const leafNodes = useMemo(
    () => findLeafNodes(nodes, edges, { allowedRelations: STRUCTURAL_RELATIONS }),
    [nodes, edges]
  )

  const inwardPaths = useMemo(
    () => calculatePathsFromLeafNodes(
      leafNodes,
      edges,
      nodes,
      {
        allowedRelations: STRUCTURAL_RELATIONS,
        stopNodeTypes: ['question'],
      }
    ),
    [leafNodes, edges, nodes]
  )

  const edgePathLookup = useMemo(() => {
    const map = new Map<string, EdgePath>()
    edges.forEach(edge => {
      if (!STRUCTURAL_RELATIONS.includes(edge.relation)) return
      const path = buildEdgePath(edge, nodeLookup)
      if (!path) return
      const key = `${edge.from || edge.source}-${edge.to || edge.target}`
      map.set(key, path)
    })
    return map
  }, [edges, nodeLookup])

  const [geometry, material, glowGeometry, glowMaterial] = useMemo(() => {
    const glowTexture = generateGlowTexture()

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3))
    geo.setAttribute('size', new THREE.BufferAttribute(new Float32Array(MAX_PARTICLES), 1))
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3))

    const mat = new THREE.ShaderMaterial({
      uniforms: { pointTexture: { value: glowTexture } },
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    })

    const glowGeo = new THREE.BufferGeometry()
    glowGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3))
    glowGeo.setAttribute('size', new THREE.BufferAttribute(new Float32Array(MAX_PARTICLES), 1))
    glowGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3))

    const glowMat = new THREE.ShaderMaterial({
      uniforms: { pointTexture: { value: glowTexture } },
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    })

    return [geo, mat, glowGeo, glowMat]
  }, [])

  // Spawn particles on each pulse trigger
  useEffect(() => {
    if (!particlePulseTrigger) return
    if (inwardPaths.length === 0 || edgePathLookup.size === 0) return

    const spawnableRoutes = inwardPaths
      .map(path => {
        const polylinePath = path
          .map(edge => {
            const key = `${edge.from || edge.source}-${edge.to || edge.target}`
            const edgePath = edgePathLookup.get(key)
            return edgePath?.reverse
          })
          .filter(Boolean) as PathPolyline[]
        return polylinePath.length > 0 ? polylinePath : null
      })
      .filter((route): route is PathPolyline[] => !!route)

    if (spawnableRoutes.length === 0) return

    const particlesThisPulse = THREE.MathUtils.randInt(MIN_PARTICLES_PER_PULSE, MAX_PARTICLES_PER_PULSE)

    for (let i = 0; i < particlesThisPulse; i++) {
      if (activeParticles.current.length >= MAX_PARTICLES) break

      const route = spawnableRoutes[Math.floor(Math.random() * spawnableRoutes.length)]
      if (!route || route.length === 0) continue

      const firstSegment = route[0]
      const startPoint = firstSegment.points[0]
      const particleColor = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]

      const particle: Particle = {
        id: particleIdCounter.current++,
        position: startPoint.clone(),
        path: route,
        edgeIndex: 0,
        distanceAlongEdge: 0,
        speed: THREE.MathUtils.randFloat(MIN_SPEED, MAX_SPEED),
        size: THREE.MathUtils.randFloat(MIN_SIZE, MAX_SIZE),
        color: particleColor,
        life: 0,
        maxLife: MAX_LIFETIME_SECONDS,
        alive: true,
      }

      activeParticles.current.push(particle)
    }
  }, [particlePulseTrigger, inwardPaths, edgePathLookup])

  useFrame((_, delta) => {
    if (!particlesRef.current || !glowParticlesRef.current) return

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
    const sizes = particlesRef.current.geometry.attributes.size.array as Float32Array
    const colors = particlesRef.current.geometry.attributes.color.array as Float32Array

    const glowPositions = glowParticlesRef.current.geometry.attributes.position.array as Float32Array
    const glowSizes = glowParticlesRef.current.geometry.attributes.size.array as Float32Array
    const glowColors = glowParticlesRef.current.geometry.attributes.color.array as Float32Array

    let particleCount = 0
    let glowCount = 0
    const updatedParticles: Particle[] = []

    activeParticles.current.forEach(particle => {
      if (!particle.alive) return

      particle.life += delta
      if (particle.life > particle.maxLife) {
        particle.alive = false
        return
      }

      let travelDistance = particle.speed * delta

      while (travelDistance > 0 && particle.edgeIndex < particle.path.length) {
        const segment = particle.path[particle.edgeIndex]
        const remaining = segment.length - particle.distanceAlongEdge

        if (travelDistance < remaining) {
          particle.distanceAlongEdge += travelDistance
          travelDistance = 0
        } else {
          travelDistance -= remaining
          particle.edgeIndex++
          particle.distanceAlongEdge = 0
          if (particle.edgeIndex >= particle.path.length) {
            particle.alive = false
            break
          }
        }
      }

      if (!particle.alive || particle.edgeIndex >= particle.path.length) return

      const currentSegment = particle.path[particle.edgeIndex]
      particle.position.copy(getPointAlongPolyline(currentSegment, particle.distanceAlongEdge))

      positions[particleCount * 3] = particle.position.x
      positions[particleCount * 3 + 1] = particle.position.y
      positions[particleCount * 3 + 2] = particle.position.z
      sizes[particleCount] = particle.size
      colors[particleCount * 3] = particle.color.r
      colors[particleCount * 3 + 1] = particle.color.g
      colors[particleCount * 3 + 2] = particle.color.b
      particleCount++

      glowPositions[glowCount * 3] = particle.position.x
      glowPositions[glowCount * 3 + 1] = particle.position.y
      glowPositions[glowCount * 3 + 2] = particle.position.z
      glowSizes[glowCount] = particle.size * GLOW_RADIUS_FACTOR
      glowColors[glowCount * 3] = GLOW_COLOR.r
      glowColors[glowCount * 3 + 1] = GLOW_COLOR.g
      glowColors[glowCount * 3 + 2] = GLOW_COLOR.b
      glowCount++

      updatedParticles.push(particle)
    })

    activeParticles.current = updatedParticles

    particlesRef.current.geometry.attributes.position.needsUpdate = true
    particlesRef.current.geometry.attributes.size.needsUpdate = true
    particlesRef.current.geometry.attributes.color.needsUpdate = true
    particlesRef.current.geometry.setDrawRange(0, particleCount)

    glowParticlesRef.current.geometry.attributes.position.needsUpdate = true
    glowParticlesRef.current.geometry.attributes.size.needsUpdate = true
    glowParticlesRef.current.geometry.attributes.color.needsUpdate = true
    glowParticlesRef.current.geometry.setDrawRange(0, glowCount)
  })

  return (
    <>
      <points ref={glowParticlesRef} geometry={glowGeometry} material={glowMaterial} />
      <points ref={particlesRef} geometry={geometry} material={material} />
    </>
  )
}
