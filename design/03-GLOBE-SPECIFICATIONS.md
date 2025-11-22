# 3D Globe Specifications

## Overview

The 3D globe is the centerpiece visualization showing the AI's reasoning process as an interactive spatial graph. It combines:
- **Spatial reasoning**: Nodes positioned based on semantic relationships
- **Real-time animation**: Nodes and connections appear as AI thinks
- **Interactive exploration**: Users can orbit, zoom, and click to understand

---

## Technical Foundation

### Rendering Engine

**Three.js Setup**
```javascript
// Scene configuration
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f); // --bg-void
scene.fog = new THREE.Fog(0x0a0a0f, 15, 100);

// Camera
const camera = new THREE.PerspectiveCamera(
  50,              // FOV
  aspect,          // Aspect ratio
  0.1,             // Near plane
  1000             // Far plane
);
camera.position.z = 25; // Default distance

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
```

### Controls

**Orbit Controls**
```javascript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.maxDistance = 50;
controls.enablePan = false; // Disable panning for cleaner UX
controls.autoRotate = true; // When idle
controls.autoRotateSpeed = 0.5;
```

---

## Scene Structure

### Idle State (No Active Query)

**Globe Container Shell**
```javascript
// Wireframe sphere indicating the "knowledge universe"
const globeGeometry = new THREE.SphereGeometry(12, 32, 32);
const globeMaterial = new THREE.MeshBasicMaterial({
  color: 0x4dd4d4,
  wireframe: true,
  transparent: true,
  opacity: 0.08
});
const globeShell = new THREE.Mesh(globeGeometry, globeMaterial);
scene.add(globeShell);

// Subtle grid texture on globe surface
const gridHelper = new THREE.GridHelper(30, 30, 0x4dd4d4, 0x4dd4d4);
gridHelper.material.opacity = 0.05;
gridHelper.material.transparent = true;
```

**Ambient Particles (Optional)**
```javascript
// Floating particles for depth
const particlesGeometry = new THREE.BufferGeometry();
const particleCount = 500;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i += 3) {
  positions[i] = (Math.random() - 0.5) * 40;
  positions[i + 1] = (Math.random() - 0.5) * 40;
  positions[i + 2] = (Math.random() - 0.5) * 40;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particlesMaterial = new THREE.PointsMaterial({
  color: 0xa8a8b8,
  size: 0.05,
  transparent: true,
  opacity: 0.3
});

const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particleSystem);
```

---

## Active State (Answering Query)

### Answer Core Block

**Central Rectangle**
```javascript
// Rounded rectangular plane for answer text
const coreGeometry = new THREE.BoxGeometry(8, 4.5, 0.3, 8, 8, 1);
const coreMaterial = new THREE.MeshStandardMaterial({
  color: 0x1a1a22,
  emissive: 0x4dd4d4,
  emissiveIntensity: 0.1,
  roughness: 0.3,
  metalness: 0.2
});

const answerCore = new THREE.Mesh(coreGeometry, coreMaterial);
answerCore.position.set(0, 0, 0); // Center of globe
scene.add(answerCore);

// Glow effect
const glowGeometry = new THREE.BoxGeometry(8.2, 4.7, 0.5);
const glowMaterial = new THREE.MeshBasicMaterial({
  color: 0x4dd4d4,
  transparent: true,
  opacity: 0.15,
  side: THREE.BackSide
});
const answerGlow = new THREE.Mesh(glowGeometry, glowMaterial);
answerCore.add(answerGlow);
```

**Answer Text (CSS3DObject or Sprite)**
```javascript
// Option 1: CSS3DRenderer for actual HTML
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';

const answerElement = document.createElement('div');
answerElement.className = 'answer-core-text';
answerElement.innerHTML = `
  <div class="answer-content">
    [AI answer streams here...]
  </div>
`;

const answerLabel = new CSS3DObject(answerElement);
answerLabel.position.set(0, 0, 0.2);
answerCore.add(answerLabel);
```

```css
/* Styling for answer core text */
.answer-core-text {
  width: 600px;
  padding: 24px;
  background: rgba(26, 26, 34, 0.95);
  border: 1px solid rgba(77, 212, 212, 0.3);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.6;
  pointer-events: none; /* Don't block 3D interactions */
}
```

---

## Knowledge Nodes

### Node Design

**Basic Node Sphere**
```javascript
class KnowledgeNode {
  constructor(data) {
    this.data = data; // { id, title, content, url, tier }

    // Node sphere
    const geometry = new THREE.SphereGeometry(0.4, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: this.getTierColor(data.tier),
      emissive: this.getTierColor(data.tier),
      emissiveIntensity: 0.3,
      roughness: 0.4,
      metalness: 0.6
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.userData = { nodeData: data };

    // Outer glow
    const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.getTierColor(data.tier),
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.mesh.add(glow);
  }

  getTierColor(tier) {
    const colors = {
      1: 0x4dda64, // Green - Direct support
      2: 0x4dd4d4, // Cyan - Supporting
      3: 0x9d7ced, // Purple - Background
      4: 0x4d6b8f  // Muted blue - Peripheral
    };
    return colors[tier] || 0x4dd4d4;
  }

  // Highlight when contributing to answer
  highlight() {
    gsap.to(this.mesh.material, {
      emissiveIntensity: 0.8,
      duration: 0.3,
      ease: 'power2.out'
    });
    gsap.to(this.mesh.scale, {
      x: 1.3,
      y: 1.3,
      z: 1.3,
      duration: 0.4,
      ease: 'elastic.out(1, 0.5)'
    });
  }

  dim() {
    gsap.to(this.mesh.material, {
      emissiveIntensity: 0.1,
      opacity: 0.4,
      duration: 0.3
    });
  }
}
```

### Node Positioning

**Spherical Layout (Default)**
```javascript
function positionNodesSpherically(nodes, radius = 10) {
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

  nodes.forEach((node, i) => {
    const y = 1 - (i / (nodes.length - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * radiusAtY * radius;
    const z = Math.sin(theta) * radiusAtY * radius;

    node.mesh.position.set(x, y * radius, z);
  });
}
```

**Force-Directed Layout (Clustering Mode)**
```javascript
// Using d3-force-3d for physics-based clustering
import { forceSimulation, forceManyBody, forceLink, forceCenter } from 'd3-force-3d';

function clusterNodes(nodes, links) {
  const simulation = forceSimulation(nodes)
    .force('charge', forceManyBody().strength(-30))
    .force('link', forceLink(links).distance(3))
    .force('center', forceCenter(0, 0, 0))
    .force('collision', forceCollide().radius(1));

  simulation.on('tick', () => {
    nodes.forEach(node => {
      node.mesh.position.set(node.x, node.y, node.z);
    });
  });
}
```

---

## Connection Edges

### Edge Rendering

**Basic Line**
```javascript
function createEdge(nodeA, nodeB, active = false) {
  const points = [
    nodeA.mesh.position,
    nodeB.mesh.position
  ];

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: active ? 0x4dd4d4 : 0x707080,
    transparent: true,
    opacity: active ? 0.6 : 0.2,
    linewidth: 1 // Note: linewidth > 1 not supported in WebGL, use Line2 for thick lines
  });

  const line = new THREE.Line(geometry, material);
  return line;
}
```

**Animated Flow (When Active)**
```javascript
// Using shaders for particle flow along edges
const edgeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0x4dd4d4) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;

    void main() {
      float flow = fract(vUv.x * 3.0 - time);
      float alpha = smoothstep(0.0, 0.2, flow) * smoothstep(1.0, 0.8, flow);
      gl_FragColor = vec4(color, alpha * 0.6);
    }
  `,
  transparent: true
});

// Update in animation loop
function animate() {
  edgeMaterial.uniforms.time.value += 0.01;
}
```

---

## Camera Animations

### Idle → Question Submitted

**Zoom Into Globe**
```javascript
function zoomIntoGlobe() {
  gsap.to(camera.position, {
    z: 18,
    duration: 1.5,
    ease: 'power2.inOut'
  });

  controls.autoRotate = false; // Stop auto-rotation
  controls.update();
}
```

### Answer Complete → Exploration Mode

**Dolly Back Slightly**
```javascript
function enableExploration() {
  gsap.to(camera.position, {
    z: 22,
    duration: 1.0,
    ease: 'power2.out'
  });

  // Re-enable full orbit controls
  controls.enabled = true;
}
```

### Reset Camera

**Return to Initial View**
```javascript
function resetCamera() {
  gsap.to(camera.position, {
    x: 0,
    y: 0,
    z: 25,
    duration: 1.2,
    ease: 'power3.inOut'
  });

  gsap.to(controls.target, {
    x: 0,
    y: 0,
    z: 0,
    duration: 1.2,
    ease: 'power3.inOut',
    onUpdate: () => controls.update()
  });

  controls.autoRotate = true;
}
```

---

## Interaction Handling

### Raycasting for Node Selection

```javascript
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', (event) => {
  // Convert mouse position to normalized device coordinates
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(nodeGroup.children);

  if (intersects.length > 0) {
    const clickedNode = intersects[0].object.userData.nodeData;
    onNodeClick(clickedNode);
  }
});
```

### Hover States

```javascript
renderer.domElement.addEventListener('mousemove', (event) => {
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(nodeGroup.children);

  // Clear previous hover
  if (hoveredNode) {
    hoveredNode.scale.set(1, 1, 1);
  }

  if (intersects.length > 0) {
    hoveredNode = intersects[0].object;
    hoveredNode.scale.set(1.15, 1.15, 1.15);
    document.body.style.cursor = 'pointer';

    // Show tooltip
    showNodeTooltip(hoveredNode.userData.nodeData, event.clientX, event.clientY);
  } else {
    hoveredNode = null;
    document.body.style.cursor = 'grab';
    hideNodeTooltip();
  }
});
```

---

## Performance Optimizations

### Level of Detail (LOD)

```javascript
// Use lower poly meshes when far from camera
const nodeLOD = new THREE.LOD();

const highDetail = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 16, 16),
  nodeMaterial
);
const lowDetail = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 8, 8),
  nodeMaterial
);

nodeLOD.addLevel(highDetail, 0);
nodeLOD.addLevel(lowDetail, 15);
```

### Instanced Meshes (for many nodes)

```javascript
// If rendering 100+ similar nodes
const nodeGeometry = new THREE.SphereGeometry(0.4, 12, 12);
const instancedMesh = new THREE.InstancedMesh(
  nodeGeometry,
  nodeMaterial,
  nodeCount
);

const matrix = new THREE.Matrix4();
nodes.forEach((node, i) => {
  matrix.setPosition(node.position.x, node.position.y, node.position.z);
  instancedMesh.setMatrixAt(i, matrix);
});
instancedMesh.instanceMatrix.needsUpdate = true;
```

### Frustum Culling

Ensure far plane is reasonable and fog helps hide pop-in:
```javascript
camera.far = 100;
scene.fog = new THREE.Fog(0x0a0a0f, 15, 100);
```

---

## Post-Processing (Optional V2)

### Bloom Effect

```javascript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.4,  // strength
  0.6,  // radius
  0.85  // threshold
);
composer.addPass(bloomPass);

// Render loop
composer.render();
```

---

## Accessibility Considerations

### Keyboard Navigation

```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    // Cycle through nodes
    selectNextNode();
  }
  if (e.key === 'Enter') {
    // Select focused node
    if (focusedNode) onNodeClick(focusedNode);
  }
  if (e.key === 'Escape') {
    // Deselect
    deselectAllNodes();
  }
});
```

### Reduced Motion

```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  controls.enableDamping = false;
  controls.autoRotate = false;
  // Disable camera animations
  gsap.globalTimeline.timeScale(100); // Instant animations
}
```

### Screen Reader Announcements

```javascript
// Announce when nodes appear
function announceNodeAddition(node) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.textContent = `New source added: ${node.title}`;
  announcement.className = 'sr-only';
  document.body.appendChild(announcement);

  setTimeout(() => announcement.remove(), 1000);
}
```

---

**Next**: Interaction Flows & Storyboards →
