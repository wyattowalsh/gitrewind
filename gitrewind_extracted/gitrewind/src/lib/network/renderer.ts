// Three.js Network Renderer
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SimulationNode, GraphEdge } from '@/types/graph';
import type { UnifiedParameters } from '@/types/parameters';
import { hslToRGB } from '@/lib/utils/color';

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

  constructor(container: HTMLElement) {
    this.container = container;

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

    // Handle resize
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  setNodes(nodes: SimulationNode[], params: UnifiedParameters): void {
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

    const matrix = new THREE.Matrix4();

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!;
      const scale = node.size * 3 * (1 + this.pulseIntensity * 0.2);

      matrix.makeTranslation(node.x, node.y, node.z);
      matrix.scale(new THREE.Vector3(scale, scale, scale));
      this.nodesMesh.setMatrixAt(i, matrix);
    }

    this.nodesMesh.instanceMatrix.needsUpdate = true;
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

    // Dispose Three.js resources
    if (this.nodesMesh) {
      this.nodesMesh.geometry.dispose();
      (this.nodesMesh.material as THREE.Material).dispose();
    }

    if (this.linesMesh) {
      this.linesMesh.geometry.dispose();
      (this.linesMesh.material as THREE.Material).dispose();
    }

    this.controls.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
