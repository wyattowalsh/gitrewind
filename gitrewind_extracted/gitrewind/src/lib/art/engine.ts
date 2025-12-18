// WebGL Art Engine
import * as THREE from 'three';
import type { UnifiedParameters } from '@/types/parameters';
import type { ArtStyle } from '@/types/events';
import { hslToRGB } from '@/lib/utils/color';

// Constellation shader - Stars and connections
const constellationShader = `
precision highp float;

uniform float u_time;
uniform float u_beat;
uniform float u_intensity;
uniform float u_complexity;
uniform float u_momentum;
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
        float twinkle = sin(u_time * 2.0 * u_momentum + float(i)) * 0.5 + 0.5;
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

    float nebula = noise(st * 2.0 + u_time * 0.1 * u_momentum) * 0.3;
    nebula += noise(st * 4.0 - u_time * 0.05 * u_momentum) * 0.2;
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

// Flow Field shader - Smooth flowing patterns
const flowFieldShader = `
precision highp float;

uniform float u_time;
uniform float u_beat;
uniform float u_intensity;
uniform float u_complexity;
uniform float u_momentum;
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
    float speed = (0.3 + u_beat * 0.2) * u_momentum;

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

    vec3 finalColor = bgColor + flowColor * u_intensity * 0.8;
    finalColor *= 1.0 + u_beat * 0.3;

    float vignette = 1.0 - length(st) * 0.3;
    finalColor *= vignette;

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Circuit shader - Tech-inspired grid with data flow
const circuitShader = `
precision highp float;

uniform float u_time;
uniform float u_beat;
uniform float u_intensity;
uniform float u_complexity;
uniform float u_momentum;
uniform vec2 u_resolution;
uniform vec3 u_primaryColor;
uniform vec3 u_secondaryColor;
uniform float u_seed;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float circuit(vec2 uv, float scale) {
    vec2 grid = fract(uv * scale);
    vec2 id = floor(uv * scale);
    float h = hash(id);
    float lineWidth = 0.08 + u_intensity * 0.04;
    float hLine = smoothstep(lineWidth, 0.0, abs(grid.y - 0.5));
    float vLine = smoothstep(lineWidth, 0.0, abs(grid.x - 0.5));
    float pattern = 0.0;
    if (h > 0.3) pattern += hLine * step(0.2, grid.x) * step(grid.x, 0.8);
    if (h > 0.5) pattern += vLine * step(0.2, grid.y) * step(grid.y, 0.8);
    if (h > 0.7) {
        float cornerSize = 0.15;
        vec2 corner = step(vec2(1.0 - cornerSize), grid) + step(grid, vec2(cornerSize));
        pattern += max(corner.x, corner.y) * 0.5;
    }
    return pattern;
}

float nodes(vec2 uv, float scale) {
    vec2 grid = fract(uv * scale);
    vec2 id = floor(uv * scale);
    float h = hash(id + 0.5);
    if (h > 0.6) {
        float dist = length(grid - 0.5);
        float nodeSize = 0.08 + u_beat * 0.04;
        float pulse = 1.0 + sin(u_time * 3.0 + h * 10.0) * 0.3 * u_momentum;
        return smoothstep(nodeSize * pulse, 0.0, dist);
    }
    return 0.0;
}

float dataFlow(vec2 uv, float scale) {
    vec2 grid = fract(uv * scale);
    vec2 id = floor(uv * scale);
    float h = hash(id);
    float speed = 2.0 + h * 3.0;
    float t = fract(u_time * speed * 0.1 * u_momentum);
    if (h > 0.4 && abs(grid.y - 0.5) < 0.1) {
        float flowPos = fract(grid.x - t);
        float packet = smoothstep(0.0, 0.1, flowPos) * smoothstep(0.3, 0.2, flowPos);
        return packet * u_intensity;
    }
    if (h > 0.6 && abs(grid.x - 0.5) < 0.1) {
        float flowPos = fract(grid.y - t);
        float packet = smoothstep(0.0, 0.1, flowPos) * smoothstep(0.3, 0.2, flowPos);
        return packet * u_intensity;
    }
    return 0.0;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 centeredUv = uv - 0.5;
    float baseScale = 8.0 + u_complexity * 12.0;

    float angle = u_time * 0.02 * u_momentum;
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 rotUv = rot * centeredUv + 0.5;

    float circuitPattern = circuit(rotUv, baseScale) * 0.6;
    circuitPattern += circuit(rotUv + 0.33, baseScale * 0.5) * 0.3;
    float nodePattern = nodes(rotUv, baseScale);
    float flow = dataFlow(rotUv, baseScale);

    float bgGradient = 1.0 - length(centeredUv) * 0.8;
    vec3 bgColor = mix(vec3(0.02, 0.02, 0.05), vec3(0.05, 0.08, 0.12), bgGradient);
    vec3 circuitColor = mix(u_primaryColor * 0.6, u_secondaryColor, circuitPattern);
    vec3 nodeColor = (u_primaryColor + u_primaryColor * u_beat * 2.0) * nodePattern;
    vec3 flowColor = vec3(1.0) * flow * 2.0;

    vec3 color = bgColor;
    color = mix(color, circuitColor, circuitPattern * 0.8);
    color += nodeColor;
    color += flowColor;

    float scanLine = sin(uv.y * u_resolution.y * 0.5 + u_time * 2.0) * 0.02;
    color += scanLine;

    float vignette = 1.0 - length(centeredUv) * 0.6;
    color *= vignette * (1.0 + u_beat * 0.3);

    gl_FragColor = vec4(color, 1.0);
}
`;

// Nebula shader - Cosmic clouds with stars
const nebulaShader = `
precision highp float;

uniform float u_time;
uniform float u_beat;
uniform float u_intensity;
uniform float u_complexity;
uniform float u_momentum;
uniform vec2 u_resolution;
uniform vec3 u_primaryColor;
uniform vec3 u_secondaryColor;
uniform float u_seed;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 4; i++) {
        value += amplitude * snoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

float stars(vec2 uv) {
    vec2 grid = fract(uv * 100.0);
    vec2 id = floor(uv * 100.0);
    float h = fract(sin(dot(id, vec2(127.1, 311.7))) * 43758.5453);
    if (h > 0.98) {
        float brightness = (h - 0.98) / 0.02;
        float dist = length(grid - 0.5);
        float twinkle = sin(u_time * 3.0 + h * 100.0) * 0.3 + 0.7;
        return smoothstep(0.05 * brightness, 0.0, dist) * twinkle;
    }
    return 0.0;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 centeredUv = (uv - 0.5) * 2.0;
    centeredUv.x *= u_resolution.x / u_resolution.y;

    float time = u_time * 0.1 * u_momentum;

    vec3 p1 = vec3(centeredUv * (1.0 + u_complexity), time);
    vec3 p2 = vec3(centeredUv * (2.0 + u_complexity * 0.5), time * 0.7);

    float n1 = fbm(p1) * 0.5 + 0.5;
    float n2 = fbm(p2 + vec3(100.0, 0.0, 0.0)) * 0.5 + 0.5;

    vec3 color1 = u_primaryColor * 1.5;
    vec3 color2 = u_secondaryColor * 1.2;

    vec3 nebula = vec3(0.0);
    nebula += color1 * pow(n1, 2.0) * u_intensity;
    nebula += color2 * pow(n2, 2.5) * u_intensity * 0.8;

    float emission = pow(n1 * n2, 3.0);
    nebula += vec3(1.0, 0.9, 0.8) * emission * u_intensity * 0.5;

    float starField = stars(uv + vec2(time * 0.01, 0.0));
    nebula += vec3(1.0) * starField;

    nebula *= 1.0 + u_beat * 0.5;

    float coreGlow = exp(-length(centeredUv) * 2.0) * u_intensity;
    nebula += mix(u_primaryColor, vec3(1.0), 0.5) * coreGlow * 0.5;

    float vignette = 1.0 - length(centeredUv) * 0.3;
    nebula *= max(vignette, 0.0);

    vec3 background = vec3(0.01, 0.01, 0.03);
    vec3 finalColor = max(nebula, background);

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
  circuit: circuitShader,
  nebula: nebulaShader,
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
  private params: UnifiedParameters;

  constructor(container: HTMLElement, params: UnifiedParameters) {
    this.container = container;
    this.params = params;
    this.startTime = Date.now();

    // Scene
    this.scene = new THREE.Scene();

    // Orthographic camera for full-screen quad
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true, // Enable for export
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Get colors
    const primaryRGB = hslToRGB(params.colors.primary);
    const secondaryRGB = hslToRGB(params.colors.secondary);

    // Shader material with all uniforms
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_beat: { value: 0 },
        u_intensity: { value: params.intensity },
        u_complexity: { value: params.complexity },
        u_momentum: { value: params.momentum },
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

  updateParams(params: Partial<UnifiedParameters>): void {
    if (params.intensity !== undefined) {
      this.material.uniforms.u_intensity!.value = params.intensity;
    }
    if (params.complexity !== undefined) {
      this.material.uniforms.u_complexity!.value = params.complexity;
    }
    if (params.momentum !== undefined) {
      this.material.uniforms.u_momentum!.value = params.momentum;
    }
    if (params.colors) {
      if (params.colors.primary) {
        const rgb = hslToRGB(params.colors.primary);
        this.material.uniforms.u_primaryColor!.value.set(rgb.r, rgb.g, rgb.b);
      }
      if (params.colors.secondary) {
        const rgb = hslToRGB(params.colors.secondary);
        this.material.uniforms.u_secondaryColor!.value.set(rgb.r, rgb.g, rgb.b);
      }
    }
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
