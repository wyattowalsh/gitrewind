// Three.js Network Renderer
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SimulationNode, GraphEdge, GraphNode } from '@/types/graph';
import type { UnifiedParameters } from '@/types/parameters';
import { hslToRGB } from '@/lib/utils/color';

export interface NodeHoverCallback {
  (node: GraphNode | null, screenPosition: { x: number; y: number } | null): void;
}

export interface NodeClickCallback {
  (node: GraphNode): void;
}

export class NetworkRenderer {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private nodesMesh: THREE.InstancedMesh | null = null;
  private linesMesh: THREE.LineSegments | null = null;
  private nodeCount = 0;
  private pulseIntensity = 0;
  private disposed = false;

  // Raycasting for interaction
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private nodesData: SimulationNode[] = [];
  private hoveredNodeIndex: number | null = null;
  private highlightMesh: THREE.Mesh | null = null;

  // Callbacks
  private onNodeHover: NodeHoverCallback | null = null;
  private onNodeClick: NodeClickCallback | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // Initialize raycaster
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 150);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(50, 50, 50);
    this.scene.add(pointLight);

    // Create highlight mesh for hovered nodes
    const highlightGeometry = new THREE.RingGeometry(1.2, 1.5, 32);
    const highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    this.highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
    this.highlightMesh.visible = false;
    this.scene.add(this.highlightMesh);

    // Handle resize
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // Handle mouse events
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.renderer.domElement.addEventListener('mousemove', this.handleMouseMove);
    this.renderer.domElement.addEventListener('click', this.handleClick);
  }

  // Set callbacks for node interactions
  setNodeCallbacks(onHover: NodeHoverCallback | null, onClick: NodeClickCallback | null): void {
    this.onNodeHover = onHover;
    this.onNodeClick = onClick;
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.disposed || !this.nodesMesh) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast against nodes
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.nodesMesh);

    if (intersects.length > 0) {
      const instanceId = intersects[0]!.instanceId;
      if (instanceId !== undefined && instanceId !== this.hoveredNodeIndex) {
        this.hoveredNodeIndex = instanceId;
        const node = this.nodesData[instanceId];
        if (node && this.onNodeHover) {
          this.onNodeHover(node, { x: event.clientX, y: event.clientY });
        }
        // Update highlight
        this.updateHighlight(node);
      }
    } else if (this.hoveredNodeIndex !== null) {
      this.hoveredNodeIndex = null;
      if (this.onNodeHover) {
        this.onNodeHover(null, null);
      }
      if (this.highlightMesh) {
        this.highlightMesh.visible = false;
      }
    }
  }

  private handleClick(event: MouseEvent): void {
    if (this.disposed || !this.nodesMesh) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.nodesMesh);

    if (intersects.length > 0) {
      const instanceId = intersects[0]!.instanceId;
      if (instanceId !== undefined) {
        const node = this.nodesData[instanceId];
        if (node && this.onNodeClick) {
          this.onNodeClick(node);
        }
      }
    }
  }

  private updateHighlight(node: SimulationNode | undefined): void {
    if (!this.highlightMesh || !node) {
      if (this.highlightMesh) this.highlightMesh.visible = false;
      return;
    }

    // Position and scale the highlight ring
    const scale = node.size * 3 * 1.5;
    this.highlightMesh.position.set(node.x, node.y, node.z);
    this.highlightMesh.scale.setScalar(scale);
    this.highlightMesh.lookAt(this.camera.position);
    this.highlightMesh.visible = true;
  }

  setNodes(nodes: SimulationNode[], params: UnifiedParameters): void {
    // Store nodes data for hover/click detection
    this.nodesData = [...nodes];

    // Remove existing mesh
    if (this.nodesMesh) {
      this.scene.remove(this.nodesMesh);
      this.nodesMesh.geometry.dispose();
      (this.nodesMesh.material as THREE.Material).dispose();
    }

    this.nodeCount = nodes.length;

    // Create instanced mesh
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      metalness: 0.3,
      roughness: 0.5,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.5,
    });

    this.nodesMesh = new THREE.InstancedMesh(geometry, material, nodes.length);

    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!;

      // Position and scale
      matrix.makeTranslation(node.x, node.y, node.z);
      matrix.scale(new THREE.Vector3(node.size * 3, node.size * 3, node.size * 3));
      this.nodesMesh.setMatrixAt(i, matrix);

      // Color
      color.set(node.color);
      this.nodesMesh.setColorAt(i, color);
    }

    this.nodesMesh.instanceMatrix.needsUpdate = true;
    if (this.nodesMesh.instanceColor) {
      this.nodesMesh.instanceColor.needsUpdate = true;
    }

    this.scene.add(this.nodesMesh);
  }

  setEdges(edges: GraphEdge[], nodes: SimulationNode[]): void {
    // Remove existing lines
    if (this.linesMesh) {
      this.scene.remove(this.linesMesh);
      this.linesMesh.geometry.dispose();
      (this.linesMesh.material as THREE.Material).dispose();
    }

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const positions: number[] = [];
    const colors: number[] = [];

    for (const edge of edges) {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);

      if (!source || !target) continue;

      positions.push(source.x, source.y, source.z);
      positions.push(target.x, target.y, target.z);

      // Line color with opacity based on weight
      const opacity = Math.min(edge.weight, 1) * 0.5;
      colors.push(1, 1, 1, opacity);
      colors.push(1, 1, 1, opacity);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    });

    this.linesMesh = new THREE.LineSegments(geometry, material);
    this.scene.add(this.linesMesh);
  }

  updateNodePositions(nodes: SimulationNode[]): void {
    if (!this.nodesMesh) return;

    // Update stored nodes data for hover detection
    this.nodesData = [...nodes];

    const matrix = new THREE.Matrix4();

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!;
      const scale = node.size * 3 * (1 + this.pulseIntensity * 0.2);

      matrix.makeTranslation(node.x, node.y, node.z);
      matrix.scale(new THREE.Vector3(scale, scale, scale));
      this.nodesMesh.setMatrixAt(i, matrix);
    }

    this.nodesMesh.instanceMatrix.needsUpdate = true;

    // Update highlight position if hovering a node
    if (this.hoveredNodeIndex !== null) {
      this.updateHighlight(this.nodesData[this.hoveredNodeIndex]);
    }
  }

  pulse(intensity: number = 1): void {
    this.pulseIntensity = intensity;
  }

  render(): void {
    if (this.disposed) return;

    // Decay pulse
    this.pulseIntensity *= 0.9;

    // Update emissive intensity based on pulse
    if (this.nodesMesh) {
      const material = this.nodesMesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3 + this.pulseIntensity * 0.5;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    if (this.disposed) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  destroy(): void {
    this.disposed = true;
    window.removeEventListener('resize', this.handleResize);

    // Remove mouse event listeners
    this.renderer.domElement.removeEventListener('mousemove', this.handleMouseMove);
    this.renderer.domElement.removeEventListener('click', this.handleClick);

    // Dispose Three.js resources
    if (this.nodesMesh) {
      this.nodesMesh.geometry.dispose();
      (this.nodesMesh.material as THREE.Material).dispose();
    }

    if (this.linesMesh) {
      this.linesMesh.geometry.dispose();
      (this.linesMesh.material as THREE.Material).dispose();
    }

    if (this.highlightMesh) {
      this.highlightMesh.geometry.dispose();
      (this.highlightMesh.material as THREE.Material).dispose();
    }

    this.controls.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
