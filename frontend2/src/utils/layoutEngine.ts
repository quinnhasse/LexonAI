import type { Node as GraphNode, LayoutMode, LayoutConfig } from '../types';
import * as THREE from 'three';

export class LayoutEngine {
  private config: LayoutConfig;

  constructor(config?: Partial<LayoutConfig>) {
    this.config = {
      mode: 'flat',
      spacing: 3,
      radius: 8,
      clusterSeparation: 5,
      ...config,
    };
  }

  calculatePositions(
    nodes: GraphNode[],
    mode: LayoutMode,
    config?: Partial<LayoutConfig>
  ): Map<string, [number, number, number]> {
    const effectiveConfig = { ...this.config, ...config, mode };

    switch (mode) {
      case 'cluster':
        return this.clusterLayout(nodes, effectiveConfig);
      case 'circular':
        return this.circularLayout(nodes, effectiveConfig);
      case 'globe':
        return this.globeLayout(nodes, effectiveConfig);
      case 'flat':
        return this.flatLayout(nodes, effectiveConfig);
      default:
        return this.flatLayout(nodes, effectiveConfig);
    }
  }

  private clusterLayout(
    nodes: GraphNode[],
    config: LayoutConfig
  ): Map<string, [number, number, number]> {
    const positions = new Map<string, [number, number, number]>();
    const { clusterSeparation = 5 } = config;

    // Group nodes by tier (using layer)
    const tierGroups = new Map<number, GraphNode[]>();
    nodes.forEach((node) => {
      const tier = node.metadata.layer || 0;
      if (!tierGroups.has(tier)) {
        tierGroups.set(tier, []);
      }
      tierGroups.get(tier)!.push(node);
    });

    // Position each tier in a ring around the center
    const tiers = Array.from(tierGroups.keys()).sort();
    tiers.forEach((tier, tierIndex) => {
      const tierNodes = tierGroups.get(tier)!;
      const tierRadius = (tierIndex + 1) * clusterSeparation;
      const angleStep = (Math.PI * 2) / Math.max(tierNodes.length, 1);

      tierNodes.forEach((node, nodeIndex) => {
        const angle = nodeIndex * angleStep;
        const x = tierRadius * Math.cos(angle);
        const z = tierRadius * Math.sin(angle);
        const y = Math.sin(angle * 2) * 0.5; // Add slight vertical variation

        positions.set(node.id, [x, y, z]);
      });
    });

    return positions;
  }

  private circularLayout(
    nodes: GraphNode[],
    config: LayoutConfig
  ): Map<string, [number, number, number]> {
    const positions = new Map<string, [number, number, number]>();
    const { radius } = config;

    // Arrange nodes in concentric circles based on tier (layer)
    const tierGroups = new Map<number, GraphNode[]>();
    nodes.forEach((node) => {
      const tier = node.metadata.layer || 0;
      if (!tierGroups.has(tier)) {
        tierGroups.set(tier, []);
      }
      tierGroups.get(tier)!.push(node);
    });

    const tiers = Array.from(tierGroups.keys()).sort();
    tiers.forEach((tier, tierIndex) => {
      const tierNodes = tierGroups.get(tier)!;
      const tierRadius = radius + tierIndex * 3;
      const angleStep = (Math.PI * 2) / Math.max(tierNodes.length, 1);

      tierNodes.forEach((node, nodeIndex) => {
        const angle = nodeIndex * angleStep;
        const x = tierRadius * Math.cos(angle);
        const z = tierRadius * Math.sin(angle);
        const y = 0; // Flat on XZ plane (Game of Thrones intro style)

        positions.set(node.id, [x, y, z]);
      });
    });

    return positions;
  }

  private globeLayout(
    nodes: GraphNode[],
    config: LayoutConfig
  ): Map<string, [number, number, number]> {
    const positions = new Map<string, [number, number, number]>();
    const { radius } = config;

    // Group nodes by tier (layer) for radial scaling
    const tierGroups = new Map<number, GraphNode[]>();
    nodes.forEach((node) => {
      const tier = node.metadata.layer || 0;
      if (!tierGroups.has(tier)) {
        tierGroups.set(tier, []);
      }
      tierGroups.get(tier)!.push(node);
    });

    const tiers = Array.from(tierGroups.keys()).sort();

    // Use golden ratio for Fibonacci sphere distribution
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = Math.PI * 2 / goldenRatio;

    tiers.forEach((tier, tierIndex) => {
      const tierNodes = tierGroups.get(tier)!;
      // Scale radius based on tier (inner tiers closer to center)
      const tierRadius = radius * (0.5 + (tierIndex * 0.5));

      tierNodes.forEach((node, nodeIndex) => {
        // Fibonacci sphere algorithm for even distribution
        const i = nodeIndex;
        const n = tierNodes.length;

        // Calculate latitude (phi) from -π/2 to π/2
        const phi = Math.asin(-1 + (2 * i) / n);

        // Calculate longitude (theta) using golden angle
        const theta = angleIncrement * i;

        // Convert spherical to Cartesian coordinates
        const x = tierRadius * Math.cos(phi) * Math.cos(theta);
        const y = tierRadius * Math.sin(phi);
        const z = tierRadius * Math.cos(phi) * Math.sin(theta);

        positions.set(node.id, [x, y, z]);
      });
    });

    return positions;
  }

  private flatLayout(
    nodes: GraphNode[],
    config: LayoutConfig
  ): Map<string, [number, number, number]> {
    const positions = new Map<string, [number, number, number]>();
    const { spacing } = config;

    // Simple grid layout for flat view
    const gridSize = Math.ceil(Math.sqrt(nodes.length));

    nodes.forEach((node, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      const x = (col - gridSize / 2) * spacing;
      const z = (row - gridSize / 2) * spacing;
      const y = 0; // Flat on XZ plane

      positions.set(node.id, [x, y, z]);
    });

    return positions;
  }

  getTransitionPath(
    startPos: [number, number, number],
    endPos: [number, number, number],
    progress: number,
    rotational: boolean = true
  ): [number, number, number] {
    if (!rotational) {
      // Simple linear interpolation
      return [
        startPos[0] + (endPos[0] - startPos[0]) * progress,
        startPos[1] + (endPos[1] - startPos[1]) * progress,
        startPos[2] + (endPos[2] - startPos[2]) * progress,
      ];
    }

    // Rotational interpolation (Game of Thrones style)
    // Convert to spherical coordinates, interpolate, convert back
    const startVec = new THREE.Vector3(...startPos);
    const endVec = new THREE.Vector3(...endPos);

    // Get spherical coordinates
    const startSpherical = new THREE.Spherical().setFromVector3(startVec);
    const endSpherical = new THREE.Spherical().setFromVector3(endVec);

    // Interpolate spherical coordinates
    const interpolatedSpherical = new THREE.Spherical(
      startSpherical.radius + (endSpherical.radius - startSpherical.radius) * progress,
      startSpherical.phi + (endSpherical.phi - startSpherical.phi) * progress,
      startSpherical.theta + (endSpherical.theta - startSpherical.theta) * progress
    );

    // Add a "swing" effect during transition
    const swingFactor = Math.sin(progress * Math.PI) * 0.3;
    interpolatedSpherical.radius *= (1 + swingFactor);

    // Convert back to Cartesian
    const result = new THREE.Vector3().setFromSpherical(interpolatedSpherical);
    return [result.x, result.y, result.z];
  }

  easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}

export const layoutEngine = new LayoutEngine();
