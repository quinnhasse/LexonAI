import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Node as GraphNode, Edge as EdgeType, LayoutMode, ColorMode } from '../types'
import Node from './Node'
import Edge from './Edge'
import { useEffect, useState, useRef } from 'react'
import { calculateHierarchicalLayout } from '../utils/graphLayout'
import { layoutEngine } from '../utils/layoutEngine'
import './GraphVisualization.css'
import { Vector3, Frustum, Matrix4, Group } from 'three'
import { getNodeRadius } from '../utils/nodeVisuals'
import { ParticleSystem } from './ParticleSystem'
import ReturnToAnswerButton from './ReturnToAnswerButton'
import './ReturnToAnswerButton.css'

interface GraphVisualizationProps {
  nodes: GraphNode[]
  edges: EdgeType[]
  highlightedNodes: Set<string>
  layoutMode?: LayoutMode
  colorMode?: ColorMode
  onNodeClick: (node: GraphNode) => void
  onInteraction: () => void
  isDemoMode?: boolean
  activeSpotlight?: string | null
}

interface AnimationState {
  visibleNodes: Set<string>
  visibleEdges: Set<string>
  nodeAnimProgress: Map<string, number> // 0 to 1
  edgeAnimProgress: Map<string, number> // 0 to 1
}

// Component to update camera position
function CameraController({ distance, layoutMode }: { distance: number, layoutMode: LayoutMode }) {
  const { camera } = useThree()

  useEffect(() => {
    if (layoutMode === 'flat') {
      // Front-facing view for 2D grid
      camera.position.set(0, 0, distance)
    } else {
      // Top-down view for 3D/Circular layouts
      camera.position.set(0, distance, 0)
    }
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [distance, camera, layoutMode])

  return null
}


// Component to track which nodes are visible in camera frustum
function NodeVisibilityTracker({
  nodes,
  onVisibilityChange,
}: {
  nodes: GraphNode[]
  onVisibilityChange: (visibleNodeIds: Set<string>) => void
}) {
  const { camera } = useThree()
  const frustum = useRef(new Frustum())
  const projectionMatrix = useRef(new Matrix4())

  useFrame(() => {
    // Update frustum from camera
    camera.updateMatrixWorld()
    projectionMatrix.current.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    )
    frustum.current.setFromProjectionMatrix(projectionMatrix.current)

    // Check which nodes are in frustum
    const visibleIds = new Set<string>()
    nodes.forEach((node) => {
      if (node.position) {
        const nodePos = new Vector3(...node.position)
        if (frustum.current.containsPoint(nodePos)) {
          visibleIds.add(node.id)
        }
      }
    })

    onVisibilityChange(visibleIds)
  })

  return null
}

// Component to handle idle rotation of the entire graph
function IdleRotation({
  groupRef,
  isUserInteracting,
}: {
  groupRef: React.RefObject<Group>
  isUserInteracting: boolean
}) {
  const lastInteractionTime = useRef(Date.now())
  const isRotating = useRef(false)

  useFrame(() => {
    if (!groupRef.current) return

    const now = Date.now()

    if (isUserInteracting) {
      // User is interacting - pause rotation
      lastInteractionTime.current = now
      isRotating.current = false
    } else {
      // Check if user has been idle for 6 seconds
      const idleTime = now - lastInteractionTime.current
      const idleThreshold = 6000 // 6 seconds

      if (idleTime > idleThreshold) {
        isRotating.current = true
      }
    }

    // Apply gentle rotation when idle
    if (isRotating.current) {
      groupRef.current.rotation.y += 0.0002 // Very slow rotation
    }
  })

  return null
}

// Apply layout based on selected mode
const applyLayout = (
  nodes: GraphNode[],
  edges: EdgeType[],
  mode: LayoutMode = 'cluster'
): GraphNode[] => {
  // Map UI modes to actual layout implementations
  switch (mode) {
    case 'cluster':
      // Hierarchical grouped structure (spherical shells with angular clustering)
      return calculateHierarchicalLayout(nodes, edges)

    case 'circular':
      // Flat 2D concentric rings (Game of Thrones style)
      const circularPositions = layoutEngine.calculatePositions(nodes, 'circular')
      return nodes.map(node => ({
        ...node,
        position: circularPositions.get(node.id) || node.position || [0, 0, 0]
      }))

    case 'globe':
      // 3D spherical surface distribution (Fibonacci sphere)
      const globePositions = layoutEngine.calculatePositions(nodes, 'globe')
      return nodes.map(node => ({
        ...node,
        position: globePositions.get(node.id) || node.position || [0, 0, 0]
      }))

    case 'flat':
      // Baseline 2D Grid Layout
      const flatPositions = layoutEngine.calculatePositions(nodes, 'flat')
      return nodes.map(node => ({
        ...node,
        position: flatPositions.get(node.id) || node.position || [0, 0, 0]
      }))

    default:
      // Fallback layout (same as cluster)
      return calculateHierarchicalLayout(nodes, edges)
  }
}

// Prune semantic edges to prevent visual overload
const pruneSemanticEdges = (
  edges: EdgeType[],
  nodes: GraphNode[],
  maxPerNode: number = 3
): EdgeType[] => {
  const semanticEdges = edges.filter(e => e.relation === 'semantic_related')
  const nonSemanticEdges = edges.filter(e => e.relation !== 'semantic_related')

  // Build node position lookup
  const nodePositions = new Map<string, Vector3>()
  nodes.forEach(node => {
    if (node.position) {
      nodePositions.set(node.id, new Vector3(...node.position))
    }
  })

  // Filter out edges where nodes are on opposite sides of the sphere
  const filteredByAngle = semanticEdges.filter(edge => {
    const sourcePos = nodePositions.get(edge.source || edge.from)
    const targetPos = nodePositions.get(edge.target || edge.to)

    if (!sourcePos || !targetPos) return false

    // Normalize positions and check dot product
    const sourceNorm = sourcePos.clone().normalize()
    const targetNorm = targetPos.clone().normalize()
    const dotProduct = sourceNorm.dot(targetNorm)

    // Drop edges where nodes point in opposite directions
    // (dot product < -0.2 means angle > ~102 degrees)
    return dotProduct >= -0.2
  })

  // Group edges by node (both source and target)
  const edgesByNode = new Map<string, EdgeType[]>()

  filteredByAngle.forEach(edge => {
    const sourceId = edge.source || edge.from
    const targetId = edge.target || edge.to

    if (!edgesByNode.has(sourceId)) {
      edgesByNode.set(sourceId, [])
    }
    if (!edgesByNode.has(targetId)) {
      edgesByNode.set(targetId, [])
    }

    edgesByNode.get(sourceId)!.push(edge)
    edgesByNode.get(targetId)!.push(edge)
  })

  // Keep only top K edges per node based on weight (default to 1.0 if not specified)
  const prunedEdgeSet = new Set<EdgeType>()

  edgesByNode.forEach((nodeEdges) => {
    // Sort by weight descending (higher weight = more important)
    const sortedEdges = [...nodeEdges].sort((a, b) => (b.weight || 1.0) - (a.weight || 1.0))

    // Take top K edges
    sortedEdges.slice(0, maxPerNode).forEach(edge => {
      prunedEdgeSet.add(edge)
    })
  })

  // Convert set back to array and combine with non-semantic edges
  return [...nonSemanticEdges, ...Array.from(prunedEdgeSet)]
}

export default function GraphVisualization({
  nodes,
  edges,
  highlightedNodes,
  layoutMode = 'flat',
  colorMode = 'white',
  onNodeClick,
  onInteraction,
  isDemoMode = false,
  activeSpotlight = null
}: GraphVisualizationProps) {
  const [positionedNodes, setPositionedNodes] = useState<GraphNode[]>([])
  const [prunedEdges, setPrunedEdges] = useState<EdgeType[]>([])
  const [cameraDistance, setCameraDistance] = useState(25)
  const [animState, setAnimState] = useState<AnimationState>({
    visibleNodes: new Set(),
    visibleEdges: new Set(),
    nodeAnimProgress: new Map(),
    edgeAnimProgress: new Map(),
  })
  const [nodesInCameraView, setNodesInCameraView] = useState<Set<string>>(new Set())
  const [isUserInteracting, setIsUserInteracting] = useState(false)
  const [particlePulseTrigger, setParticlePulseTrigger] = useState(0)
  const animationFrameRef = useRef<number>()
  const graphGroupRef = useRef<Group>(null)
  const orbitControlsRef = useRef<any>(null)
  const cameraAnimationRef = useRef<number | null>(null)
  const previousNodeIdsRef = useRef<Set<string>>(new Set())
  const previousLayoutModeRef = useRef<LayoutMode>(layoutMode)

  // Helper to check if node matches active spotlight
  const isNodeInSpotlight = (node: GraphNode): boolean => {
    if (!activeSpotlight) return true
    
    switch (activeSpotlight) {
      case 'QUERY':
        return node.type === 'question' || node.type === 'answer_root'
      case 'LOGIC':
        return node.type === 'answer_block'
      case 'EVIDENCE':
        return node.type === 'direct_source'
      case 'CONTEXT':
        return node.type === 'secondary_source'
      default:
        return false
    }
  }

  useEffect(() => {
    if (nodes.length > 0) {
      const currentNodeIds = new Set(nodes.map(n => n.id))
      const previousNodeIds = previousNodeIdsRef.current
      const layoutModeChanged = previousLayoutModeRef.current !== layoutMode

      // Detect if this is an incremental update (new nodes added) or a full replacement
      // Force full re-layout if layout mode changed
      const isIncrementalUpdate = !layoutModeChanged &&
        previousNodeIds.size > 0 &&
        Array.from(previousNodeIds).every(id => currentNodeIds.has(id))

      if (isIncrementalUpdate) {
        // Only position new nodes, keep existing ones
        const newNodeIds = Array.from(currentNodeIds).filter(id => !previousNodeIds.has(id))
        const newNodes = nodes.filter(n => newNodeIds.includes(n.id))

        // Position new nodes near their parent source nodes
        const positionedNewNodes = newNodes.map(newNode => {
          // Find parent edge (edge pointing TO this new node)
          const parentEdge = edges.find(e => e.to === newNode.id || e.target === newNode.id)
          if (parentEdge) {
            const parentId = parentEdge.from || parentEdge.source
            const parentNode = positionedNodes.find(n => n.id === parentId)

            if (parentNode && parentNode.position) {
              // Position new node near parent with some random offset
              const angle = Math.random() * Math.PI * 2
              const distance = 3 + Math.random() * 2
              return {
                ...newNode,
                position: [
                  parentNode.position[0] + Math.cos(angle) * distance,
                  parentNode.position[1] + (Math.random() - 0.5) * 2,
                  parentNode.position[2] + Math.sin(angle) * distance,
                ] as [number, number, number]
              }
            }
          }
          // Fallback: random position near origin
          return {
            ...newNode,
            position: [
              (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 5,
              (Math.random() - 0.5) * 10,
            ] as [number, number, number]
          }
        })

        // Merge existing positioned nodes with new ones
        const allPositioned = [...positionedNodes, ...positionedNewNodes]
        setPositionedNodes(allPositioned)

        // Keep existing pruned edges and add new ones without re-pruning
        const debugNewNodeIds = new Set(positionedNewNodes.map(n => n.id))
        const debugNewEdges = edges.filter(e => debugNewNodeIds.has(e.to || e.target || ''))

        // Merge prunedEdges with new edges (avoiding duplicates)
        const existingEdgeKeys = new Set(prunedEdges.map(e => `${e.source || e.from}-${e.target || e.to}`))
        const newEdgesToAdd = debugNewEdges.filter(e => {
          const key = `${e.source || e.from}-${e.target || e.to}`
          return !existingEdgeKeys.has(key)
        })

        setPrunedEdges([...prunedEdges, ...newEdgesToAdd])

        console.log('[GraphViz] Animating new nodes:', positionedNewNodes.length)
        console.log('[GraphViz] Animating new edges:', debugNewEdges)
        console.log('[GraphViz] Adding edges to pruned:', newEdgesToAdd)

        // Animate new nodes immediately
        positionedNewNodes.forEach((node, idx) => {
          setTimeout(() => {
            animateNode(node.id, 600)
          }, idx * 150)
        })

        // Animate new edges immediately
        debugNewEdges.forEach((edge, idx) => {
          const sourceId = edge.source || edge.from
          const targetId = edge.target || edge.to
          const edgeKey = `${sourceId}-${targetId}`
          console.log('[GraphViz] Scheduling edge animation:', edgeKey)
          setTimeout(() => {
            console.log('[GraphViz] Animating edge NOW:', edgeKey)
            animateEdge(edgeKey, 800)
          }, idx * 150 + 400)
        })
      } else {
        // Full graph replacement - apply layout to all nodes
        const positioned = applyLayout(nodes, edges, layoutMode)
        setPositionedNodes(positioned)

        // Prune semantic edges to prevent visual overload
        const pruned = pruneSemanticEdges(edges, positioned, 3)
        setPrunedEdges(pruned)

        // Calculate bounding box to fit all nodes
        let maxDistance = 0
        positioned.forEach(node => {
          if (node.position) {
            const distance = Math.sqrt(
              node.position[0] ** 2 +
              node.position[2] ** 2
            )
            maxDistance = Math.max(maxDistance, distance)
          }
        })

        // Add generous padding (2x + 15 units) for comfortable viewing
        const fittedDistance = maxDistance * 2 + 15
        setCameraDistance(fittedDistance)

        // Start animation sequence with pruned edges
        startAnimationSequence(positioned, pruned)
        setParticlePulseTrigger(0)
      }

      // Update the refs for next comparison
      previousNodeIdsRef.current = currentNodeIds
      previousLayoutModeRef.current = layoutMode
    }
  }, [nodes, edges, layoutMode])

  // Pulse scheduler for traveling particles
  useEffect(() => {
    if (positionedNodes.length === 0 || prunedEdges.length === 0) return

    let cancelled = false
    let timeoutId: number | undefined

    const scheduleNextPulse = (initialDelay?: number) => {
      const baseDelay = initialDelay !== undefined ? initialDelay : 900
      const jitter = 500 + Math.random() * 600 // semi-fast, slightly irregular cadence
      timeoutId = window.setTimeout(() => {
        if (cancelled) return
        setParticlePulseTrigger(tick => tick + 1)
        scheduleNextPulse()
      }, baseDelay + jitter)
    }

    scheduleNextPulse(1200)

    return () => {
      cancelled = true
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [positionedNodes, prunedEdges])

  const startAnimationSequence = (nodes: GraphNode[], edges: EdgeType[]) => {
    // Reset animation state
    setAnimState({
      visibleNodes: new Set(),
      visibleEdges: new Set(),
      nodeAnimProgress: new Map(),
      edgeAnimProgress: new Map(),
    })

    // Categorize nodes by type/layer - SKIP question nodes
    const answerRootNodes = nodes.filter(n => n.type === 'answer_root')
    const answerBlockNodes = nodes.filter(n => n.type === 'answer_block')
    const directSourceNodes = nodes.filter(n => n.type === 'direct_source')
    const secondarySourceNodes = nodes.filter(n => n.type === 'secondary_source')

    // Categorize edges by relation type - filter out question edges
    const answersEdges = edges.filter(e =>
      e.relation === 'answers' &&
      e.from !== 'q' && e.to !== 'q' // Skip edges connected to question node
    )
    const supportsEdges = edges.filter(e => e.relation === 'supports')
    const underpinsEdges = edges.filter(e => e.relation === 'underpins')
    const semanticEdges = edges.filter(e => e.relation === 'semantic_related')

    const timeline: Array<{delay: number, action: () => void}> = []

    // Stage 1: Answer root node appears (0-600ms)
    answerRootNodes.forEach((node, idx) => {
      timeline.push({
        delay: idx * 100,
        action: () => animateNode(node.id, 600)
      })
    })

    // Stage 2: Answer edges (answer → blocks) (700ms - staggered)
    answersEdges.forEach((edge, idx) => {
      timeline.push({
        delay: 700 + idx * 80,
        action: () => animateEdge(`${edge.from}-${edge.to}`, 400)
      })
    })

    // Stage 3: Answer block nodes appear (900ms - staggered)
    answerBlockNodes.forEach((node, idx) => {
      timeline.push({
        delay: 900 + idx * 100,
        action: () => animateNode(node.id, 500)
      })
    })

    // Stage 4: Supports edges (blocks → direct sources) (1500ms + block count delay)
    const blockDelay = 1500 + answerBlockNodes.length * 100
    supportsEdges.forEach((edge, idx) => {
      timeline.push({
        delay: blockDelay + idx * 50,
        action: () => animateEdge(`${edge.from}-${edge.to}`, 350)
      })
    })

    // Stage 5: Direct source nodes appear (1600ms + block count delay)
    const sourceDelay = blockDelay + 100
    directSourceNodes.forEach((node, idx) => {
      timeline.push({
        delay: sourceDelay + idx * 60,
        action: () => animateNode(node.id, 450)
      })
    })

    // Stage 6: Underpins edges (secondary → direct sources) (2200ms + source count delay)
    const secondaryDelay = sourceDelay + directSourceNodes.length * 60 + 500
    underpinsEdges.forEach((edge, idx) => {
      timeline.push({
        delay: secondaryDelay + idx * 40,
        action: () => animateEdge(`${edge.from}-${edge.to}`, 300)
      })
    })

    // Stage 7: Secondary source nodes appear (2300ms + delays)
    const conceptDelay = secondaryDelay + 100
    secondarySourceNodes.forEach((node, idx) => {
      timeline.push({
        delay: conceptDelay + idx * 50,
        action: () => animateNode(node.id, 400)
      })
    })

    // Stage 8: Semantic related edges fade in last (3000ms + all delays)
    const semanticDelay = conceptDelay + secondarySourceNodes.length * 50 + 500
    semanticEdges.forEach((edge, idx) => {
      timeline.push({
        delay: semanticDelay + idx * 30,
        action: () => animateEdge(`${edge.from}-${edge.to}`, 250)
      })
    })

    // Execute timeline
    timeline.forEach(({ delay, action }) => {
      setTimeout(action, delay)
    })
  }

  // Animate a node appearing
  const animateNode = (nodeId: string, duration: number) => {
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)

      setAnimState(prev => ({
        ...prev,
        visibleNodes: new Set([...prev.visibleNodes, nodeId]),
        nodeAnimProgress: new Map(prev.nodeAnimProgress).set(nodeId, eased),
      }))

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animate()
  }

  // Animate an edge drawing
  const animateEdge = (edgeKey: string, duration: number) => {
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out quad for smooth line drawing
      const eased = 1 - Math.pow(1 - progress, 2)

      setAnimState(prev => ({
        ...prev,
        visibleEdges: new Set([...prev.visibleEdges, edgeKey]),
        edgeAnimProgress: new Map(prev.edgeAnimProgress).set(edgeKey, eased),
      }))

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animate()
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (cameraAnimationRef.current !== null) {
        cancelAnimationFrame(cameraAnimationRef.current)
      }
    }
  }, [])

  if (positionedNodes.length === 0) {
    return <div className="graph-container"></div>
  }

  const handleInteractionStart = () => {
    // Cancel any ongoing camera animation
    if (cameraAnimationRef.current !== null) {
      cancelAnimationFrame(cameraAnimationRef.current)
      cameraAnimationRef.current = null

      // Re-enable damping if it was disabled
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enableDamping = true
      }
    }

    setIsUserInteracting(true)
    onInteraction()
  }

  const handleInteractionEnd = () => {
    setIsUserInteracting(false)
  }

  const handleReturnToAnswer = () => {
    if (!orbitControlsRef.current) return

    // Cancel any existing animation
    if (cameraAnimationRef.current !== null) {
      cancelAnimationFrame(cameraAnimationRef.current)
      cameraAnimationRef.current = null
    }

    // Find the answer node position (should be at [0, 0, 0])
    const answerNode = positionedNodes.find(n => n.type === 'answer_root')
    if (!answerNode || !answerNode.position) return

    const controls = orbitControlsRef.current
    const targetPos = new Vector3(...answerNode.position)

    // Store starting positions
    const startCameraPos = controls.object.position.clone()
    const startTargetPos = controls.target.clone()

    // Calculate final positions
    const finalTargetPos = targetPos.clone()
    // Position camera with offset: farther away and at an angle for better view
    const finalCameraPos = new Vector3(20, 40, 15)

    // Disable damping during animation to prevent jitter/flip
    controls.enableDamping = false

    const startTime = Date.now()
    const duration = 1200 // 1.2 seconds for a nice smooth animation

    const animateCamera = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease in-out cubic for smooth start and end
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

      // Interpolate both camera position and target
      const newCameraPos = new Vector3().lerpVectors(startCameraPos, finalCameraPos, eased)
      const newTargetPos = new Vector3().lerpVectors(startTargetPos, finalTargetPos, eased)

      // Apply new positions
      controls.object.position.copy(newCameraPos)
      controls.target.copy(newTargetPos)
      controls.object.lookAt(newTargetPos)

      if (progress < 1) {
        cameraAnimationRef.current = requestAnimationFrame(animateCamera)
      } else {
        // Animation complete - cleanup
        cameraAnimationRef.current = null
        controls.enableDamping = true
      }
    }

    animateCamera()
  }

  return (
    <div className="graph-container">
      <Canvas
        onPointerDown={handleInteractionStart}
        onPointerUp={handleInteractionEnd}
        onWheel={handleInteractionStart}
      >
        <PerspectiveCamera makeDefault position={[0, 25, 0]} />
        <CameraController distance={cameraDistance} layoutMode={layoutMode} />
        <NodeVisibilityTracker
          nodes={positionedNodes}
          onVisibilityChange={setNodesInCameraView}
        />
        <OrbitControls
          ref={orbitControlsRef}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          minDistance={0}
          maxDistance={500}
          mouseButtons={{
            LEFT: 2,   // Pan (was rotate)
            MIDDLE: 1, // Zoom
            RIGHT: 0   // Rotate (was pan)
          }}
          target={[0, 0, 0]}
          onStart={handleInteractionStart}
          onEnd={handleInteractionEnd}
        />

        {/* Lighting - monochrome aesthetic */}
        <ambientLight intensity={0.3} color="#ffffff" />
        <pointLight position={[10, 10, 10]} intensity={0.6} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#e0e0e0" />
        <pointLight position={[0, 15, 0]} intensity={0.2} color="#cccccc" />

        {/* Idle rotation controller */}
        <IdleRotation groupRef={graphGroupRef} isUserInteracting={isUserInteracting} />

        {/* Graph group - wraps all nodes and edges for idle rotation */}
        <group ref={graphGroupRef}>
          {/* Render edges first (so they appear behind nodes) */}
          {prunedEdges.map((edge, idx) => {
            // Normalize edge properties to ensure source/target are set
            const sourceId = edge.source || edge.from
            const targetId = edge.target || edge.to

            if (!sourceId || !targetId) return null

            const sourceNode = positionedNodes.find(n => n.id === sourceId)
            const targetNode = positionedNodes.find(n => n.id === targetId)

            if (!sourceNode?.position || !targetNode?.position) return null

            const edgeKey = `${sourceId}-${targetId}`
            const isVisible = animState.visibleEdges.has(edgeKey)
            const progress = animState.edgeAnimProgress.get(edgeKey) || 0

            if (!isVisible) return null

            const isHighlighted =
              highlightedNodes.has(edge.source || edge.from) && highlightedNodes.has(edge.target || edge.to)

            // Check if source and/or target nodes are in camera view
            const sourceInView = nodesInCameraView.has(edge.source || edge.from)
            const targetInView = nodesInCameraView.has(edge.target || edge.to)
            const anyNodeInView = sourceInView || targetInView

            // Make underpins edges (source -> concept) white and bright
            const isUnderpinsEdge = edge.relation === 'underpins'

            return (
              <Edge
                key={`${edge.source}-${edge.target}-${idx}`}
                start={sourceNode.position as [number, number, number]}
                end={targetNode.position as [number, number, number]}
                isHighlighted={isHighlighted || isUnderpinsEdge}
                animationProgress={progress}
                sourceRadius={getNodeRadius(sourceNode.type)}
                targetRadius={getNodeRadius(targetNode.type)}
                relation={edge.relation}
                anyNodeInCameraView={anyNodeInView}
              />
            )
          })}

          {/* Traveling particles to show thought pulses */}
          {positionedNodes.length > 0 && prunedEdges.length > 0 && (
            <ParticleSystem
              nodes={positionedNodes}
              edges={prunedEdges}
              particlePulseTrigger={particlePulseTrigger}
            />
          )}

          {/* Render nodes */}
          {positionedNodes.map((node) => {
            const isVisible = animState.visibleNodes.has(node.id)
            const progress = animState.nodeAnimProgress.get(node.id) || 0

            if (!isVisible) return null

            return (
              <Node
                key={node.id}
                node={node}
                isHighlighted={highlightedNodes.has(node.id)}
                onClick={() => onNodeClick(node)}
                animationProgress={progress}
                colorMode={colorMode}
              />
            )
          })}
        </group>
      </Canvas>
      <ReturnToAnswerButton onReturnToAnswer={handleReturnToAnswer} isDemoMode={isDemoMode} />
    </div>
  )
}
