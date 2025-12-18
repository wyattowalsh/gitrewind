// WebGL Art Engine
import * as THREE from 'three';
import type { UnifiedParameters } from '@/types/parameters';
import type { ArtStyle } from '@/types/events';
import { hslToRGB } from '@/lib/utils/color';

// Import shaders as raw strings
const constellationShader = `
precision highp float;

uniform float u_time;
uniform float u_beat;
uniform float u_intensity;
uniform float u_complexity;
uniform vec2 u_resolution;
uniform vec3 u_primaryColor;
uniform vec3 u_secondaryColor;
uniform float u_seed;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233) + u_seed)) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 st = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

    vec3 bgColor = mix(vec3(0.02, 0.02, 0.05), vec3(0.05, 0.02, 0.08), uv.y);

    float stars = 0.0;
    for (int i = 0; i < 50; i++) {
        vec2 starPos = vec2(
            random(vec2(float(i), 0.0)) * 2.0 - 1.0,
            random(vec2(0.0, float(i))) * 2.0 - 1.0
        ) * 1.5;

        float dist = length(st - starPos);
        float size = 0.003 + random(vec2(float(i), float(i))) * 0.005;
        float twinkle = sin(u_time * 2.0 + float(i)) * 0.5 + 0.5;
        twinkle = mix(0.5, 1.0, twinkle);
        float pulse = 1.0 + u_beat * 0.5;
        size *= pulse;

        stars += smoothstep(size, 0.0, dist) * twinkle * u_intensity;
    }

    float connections = 0.0;
    for (int i = 0; i < 30; i++) {
        vec2 starA = vec2(random(vec2(float(i), 0.0)), random(vec2(0.0, float(i)))) * 3.0 - 1.5;

        for (int j = i + 1; j < 30; j++) {
            vec2 starB = vec2(random(vec2(float(j), 0.0)), random(vec2(0.0, float(j)))) * 3.0 - 1.5;

            float starDist = length(starA - starB);
            if (starDist < 0.5 * u_complexity) {
                vec2 pa = st - starA;
                vec2 ba = starB - starA;
                float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
                float lineDist = length(pa - ba * h);

                float lineIntensity = smoothstep(0.003, 0.0, lineDist);
                lineIntensity *= 1.0 - starDist / (0.5 * u_complexity);
                lineIntensity *= (1.0 + u_beat * 0.3);

                connections += lineIntensity * 0.3;
            }
        }
    }

    float nebula = noise(st * 2.0 + u_time * 0.1) * 0.3;
    nebula += noise(st * 4.0 - u_time * 0.05) * 0.2;
    nebula *= u_intensity * 0.5;

    vec3 starColor = mix(u_primaryColor, u_secondaryColor, stars);
    vec3 connectionColor = u_primaryColor * 0.5;
    vec3 nebulaColor = mix(u_primaryColor, u_secondaryColor, nebula) * 0.3;

    vec3 finalColor = bgColor;
    finalColor += nebulaColor;
    finalColor += connectionColor * connections;
    finalColor += starColor * stars;

    float vignette = 1.0 - length(st) * 0.3;
    finalColor *= vignette;

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

const flowFieldShader = `
precision highp float;

uniform float u_time;
uniform float u_beat;
uniform float u_intensity;
uniform float u_complexity;
uniform vec2 u_resolution;
uniform vec3 u_primaryColor;
uniform vec3 u_secondaryColor;
uniform float u_seed;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 st = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

    vec3 bgColor = vec3(0.02, 0.02, 0.04);

    float scale = 2.0 + u_complexity * 2.0;
    float speed = 0.3 + u_beat * 0.2;

    float flow = 0.0;
    for (int i = 0; i < 3; i++) {
        float layerScale = scale * (1.0 + float(i) * 0.5);
        float layerTime = u_time * speed * (1.0 - float(i) * 0.2);
        vec2 pos = st * layerScale + vec2(layerTime, 0.0);
        float n = snoise(pos + u_seed);
        flow += n * (1.0 / float(i + 1));
    }
    flow = flow * 0.5 + 0.5;

    vec3 flowColor = mix(u_primaryColor, u_secondaryColor, flow);
    flowColor *= 0.3 + flow * 0.7;

    vec3 finalColor = bgColor + flowColor * 0.5;
    finalColor *= 1.0 + u_beat * 0.2;

    float vignette = 1.0 - length(st) * 0.3;
    finalColor *= vignette;

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

const vertexShader = `
void main() {
    gl_Position = vec4(position, 1.0);
}
`;

const SHADERS: Record<ArtStyle, string> = {
  constellation: constellationShader,
  flowField: flowFieldShader,
  circuit: constellationShader, // Fallback
  nebula: flowFieldShader, // Fallback
};

export class ArtEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private startTime: number;
  private beatIntensity = 0;
  private disposed = false;

  constructor(container: HTMLElement, params: UnifiedParameters) {
    this.container = container;
    this.startTime = Date.now();

    // Scene
    this.scene = new THREE.Scene();

    // Orthographic camera for full-screen quad
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Get colors
    const primaryRGB = hslToRGB(params.colors.primary);
    const secondaryRGB = hslToRGB(params.colors.secondary);

    // Shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_beat: { value: 0 },
        u_intensity: { value: params.intensity },
        u_complexity: { value: params.complexity },
        u_resolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
        u_primaryColor: { value: new THREE.Vector3(primaryRGB.r, primaryRGB.g, primaryRGB.b) },
        u_secondaryColor: { value: new THREE.Vector3(secondaryRGB.r, secondaryRGB.g, secondaryRGB.b) },
        u_seed: { value: params.seed % 1000 },
      },
      vertexShader,
      fragmentShader: SHADERS[params.art.style] ?? constellationShader,
    });

    // Full-screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    // Handle resize
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  setStyle(style: ArtStyle): void {
    this.material.fragmentShader = SHADERS[style] ?? constellationShader;
    this.material.needsUpdate = true;
  }

  pulse(intensity: number = 1): void {
    this.beatIntensity = intensity;
  }

  render(): void {
    if (this.disposed) return;

    // Update uniforms
    const elapsed = (Date.now() - this.startTime) / 1000;
    this.material.uniforms.u_time!.value = elapsed;
    this.material.uniforms.u_beat!.value = this.beatIntensity;

    // Decay beat
    this.beatIntensity *= 0.9;

    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    if (this.disposed) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.renderer.setSize(width, height);
    this.material.uniforms.u_resolution!.value.set(width, height);
  }

  getCanvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  destroy(): void {
    this.disposed = true;
    window.removeEventListener('resize', this.handleResize);

    this.mesh.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
