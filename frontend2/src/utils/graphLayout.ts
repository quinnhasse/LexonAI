import { Node, Edge } from '../types';

/**
 * Convert spherical coordinates (theta, phi, radius) to Cartesian (x, y, z)
 * theta: azimuthal angle (0 to 2π) - horizontal rotation
 * phi: polar angle (0 to π) - vertical from top to bottom
 * radius: distance from origin
 */
function sphericalToCartesian(theta: number, phi: number, radius: number): [number, number, number] {
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}

/**
 * Calculate angular position (theta, phi) for a node on a spherical shell
 * Uses clustering logic to position nodes near their connected parents
 */
interface AngularPosition {
  theta: number; // azimuthal angle (0 to 2π)
  phi: number;   // polar angle (0 to π)
}

/**
 * Adaptive radial shell layout with angular clustering
 *
 * Strategy:
 * 1. Layer radii are FIXED and proportional to outer radius (onion structure)
 * 2. Answer blocks are distributed in angular sectors around the sphere
 * 3. Direct sources cluster near their parent answer blocks
 * 4. Secondary sources cluster near their parent direct sources
 *
 * This ensures connected nodes are angularly close, preventing cross-cutting edges
 */
export function calculateHierarchicalLayout(nodes: Node[], edges: Edge[] = []): Node[] {
  const positionedNodes: Node[] = [];

  // ADAPTIVE radial shells - outer radius adapts to node count, inner radii are proportional
  // More nodes = larger outer radius for better spacing
  const nodeCount = nodes.length;
  const baseOuterRadius = Math.max(36, Math.min(60, 30 + nodeCount * 0.5));

  const layerRadii = {
    0: 0,                           // Core: question & answer_root at origin
    1: baseOuterRadius * 0.35,      // Inner shell: answer_blocks (~35% of outer)
    2: baseOuterRadius * 0.65,      // Middle shell: direct_sources (~65% of outer)
    3: baseOuterRadius * 1.0,       // Outer shell: secondary_sources (100% = outer halo)
  };

  // Group nodes by layer
  const nodesByLayer: Record<number, Node[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
  };

  nodes.forEach(node => {
    const layer = node.metadata.layer;
    if (nodesByLayer[layer]) {
      nodesByLayer[layer].push(node);
    }
  });

  // Build edge lookup maps for clustering logic
  const edgesBySource = new Map<string, Edge[]>();
  const edgesByTarget = new Map<string, Edge[]>();

  edges.forEach(edge => {
    const source = edge.source || edge.from;
    const target = edge.target || edge.to;

    if (!edgesBySource.has(source)) {
      edgesBySource.set(source, []);
    }
    edgesBySource.get(source)!.push(edge);

    if (!edgesByTarget.has(target)) {
      edgesByTarget.set(target, []);
    }
    edgesByTarget.get(target)!.push(edge);
  });

  // Track angular positions for clustering
  const nodeAngularPositions = new Map<string, AngularPosition>();

  // Position Layer 0 nodes (answer_root only - skip question) at center
  nodesByLayer[0].forEach((node) => {
    // Skip question nodes entirely
    if (node.type === 'question') {
      return;
    }

    // Answer root at exact center
    positionedNodes.push({
      ...node,
      position: [0, 0, 0],
    });

    // Center node has no angular position (radius = 0)
  });

  // Position Layer 1 nodes (answer_blocks) in angular sectors
  // Distribute evenly around the sphere with small jitter
  const layer1Radius = layerRadii[1];
  const layer1Nodes = nodesByLayer[1];
  const numBlocks = layer1Nodes.length;

  layer1Nodes.forEach((node, i) => {
    // Distribute blocks evenly around azimuth (theta)
    const sectorAngle = (2 * Math.PI) / numBlocks;
    const theta = i * sectorAngle + (Math.random() - 0.5) * sectorAngle * 0.3;

    // Distribute vertically (phi) with slight jitter around equator
    // phi = π/2 is equator, add jitter ±π/4 for vertical spread
    const phi = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;

    const position = sphericalToCartesian(theta, phi, layer1Radius);

    positionedNodes.push({
      ...node,
      position,
    });

    nodeAngularPositions.set(node.id, { theta, phi });
  });

  // Position Layer 2 nodes (direct_sources) near their parent answer_blocks
  const layer2Radius = layerRadii[2];
  const layer2Nodes = nodesByLayer[2];

  layer2Nodes.forEach((node) => {
    // Find which answer_block(s) this source supports
    const incomingEdges = edgesByTarget.get(node.id) || [];
    const supportEdges = incomingEdges.filter(e => e.relation === 'supports');

    if (supportEdges.length > 0) {
      // Position near the first/primary supporting block
      const primaryBlockId = supportEdges[0].source || supportEdges[0].from;
      const parentPosition = nodeAngularPositions.get(primaryBlockId);

      if (parentPosition) {
        // Place near parent with small angular offset
        const offsetAngle = (Math.random() - 0.5) * Math.PI / 6; // ±30° jitter
        const theta = parentPosition.theta + offsetAngle;
        const phi = parentPosition.phi + (Math.random() - 0.5) * Math.PI / 8; // Small vertical jitter

        const position = sphericalToCartesian(theta, phi, layer2Radius);

        positionedNodes.push({
          ...node,
          position,
        });

        nodeAngularPositions.set(node.id, { theta, phi });
        return;
      }
    }

    // Fallback: if no parent found, place randomly (shouldn't happen with valid data)
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 2;
    const position = sphericalToCartesian(theta, phi, layer2Radius);

    positionedNodes.push({
      ...node,
      position,
    });

    nodeAngularPositions.set(node.id, { theta, phi });
  });

  // Position Layer 3 nodes (secondary_sources) near their parent direct_sources
  const layer3Radius = layerRadii[3];
  const layer3Nodes = nodesByLayer[3];

  layer3Nodes.forEach((node) => {
    // Find which direct_source(s) this secondary source underpins
    const incomingEdges = edgesByTarget.get(node.id) || [];
    const underpinEdges = incomingEdges.filter(e => e.relation === 'underpins');

    if (underpinEdges.length > 0) {
      // Position near the first/primary underpinning source
      const primarySourceId = underpinEdges[0].source || underpinEdges[0].from;
      const parentPosition = nodeAngularPositions.get(primarySourceId);

      if (parentPosition) {
        // Place near parent with small angular offset
        const offsetAngle = (Math.random() - 0.5) * Math.PI / 4; // ±45° jitter (more spread)
        const theta = parentPosition.theta + offsetAngle;
        const phi = parentPosition.phi + (Math.random() - 0.5) * Math.PI / 6; // Small vertical jitter

        const position = sphericalToCartesian(theta, phi, layer3Radius);

        positionedNodes.push({
          ...node,
          position,
        });

        nodeAngularPositions.set(node.id, { theta, phi });
        return;
      }
    }

    // Fallback: if no parent found, place randomly (shouldn't happen with valid data)
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 2;
    const position = sphericalToCartesian(theta, phi, layer3Radius);

    positionedNodes.push({
      ...node,
      position,
    });

    nodeAngularPositions.set(node.id, { theta, phi });
  });

  return positionedNodes;
}
