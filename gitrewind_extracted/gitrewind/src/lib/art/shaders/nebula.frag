// Nebula Shader - Cosmic cloud visualization
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_intensity;
uniform float u_complexity;
uniform float u_momentum;
uniform vec3 u_primaryColor;
uniform vec3 u_secondaryColor;
uniform float u_beat;

#define PI 3.14159265359
#define OCTAVES 5

// Simplex noise functions
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
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

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
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Fractal Brownian Motion
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < OCTAVES; i++) {
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return value;
}

// Turbulence
float turbulence(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < OCTAVES; i++) {
    value += amplitude * abs(snoise(p * frequency));
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return value;
}

// Star field
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

  // Base nebula with multiple layers
  vec3 p1 = vec3(centeredUv * (1.0 + u_complexity), time);
  vec3 p2 = vec3(centeredUv * (2.0 + u_complexity * 0.5), time * 0.7);
  vec3 p3 = vec3(centeredUv * (0.5 + u_complexity * 0.3), time * 1.3);

  float n1 = fbm(p1) * 0.5 + 0.5;
  float n2 = fbm(p2 + vec3(100.0, 0.0, 0.0)) * 0.5 + 0.5;
  float n3 = turbulence(p3) * 0.5 + 0.5;

  // Color mixing based on noise
  vec3 color1 = u_primaryColor * 1.5;
  vec3 color2 = u_secondaryColor * 1.2;
  vec3 color3 = mix(u_primaryColor, vec3(1.0, 0.5, 0.8), 0.5);

  // Build nebula colors
  vec3 nebula = vec3(0.0);
  nebula += color1 * pow(n1, 2.0) * u_intensity;
  nebula += color2 * pow(n2, 2.5) * u_intensity * 0.8;
  nebula += color3 * pow(n3, 3.0) * u_intensity * 0.6;

  // Add dust lanes (darker regions)
  float dust = turbulence(vec3(centeredUv * 3.0, time * 0.5));
  nebula *= 1.0 - dust * 0.4;

  // Add bright emission regions
  float emission = pow(n1 * n2, 3.0);
  nebula += vec3(1.0, 0.9, 0.8) * emission * u_intensity * 0.5;

  // Add stars
  float starField = stars(uv + vec2(time * 0.01, 0.0));
  nebula += vec3(1.0) * starField;

  // Beat-reactive pulsing
  float beatGlow = u_beat * 0.5;
  nebula *= 1.0 + beatGlow;

  // Add central bright core
  float coreGlow = exp(-length(centeredUv) * 2.0) * u_intensity;
  nebula += mix(u_primaryColor, vec3(1.0), 0.5) * coreGlow * 0.5;

  // Vignette
  float vignette = 1.0 - length(centeredUv) * 0.3;
  nebula *= max(vignette, 0.0);

  // Gamma correction
  nebula = pow(nebula, vec3(0.9));

  // Background (deep space)
  vec3 background = vec3(0.01, 0.01, 0.03);
  vec3 finalColor = max(nebula, background);

  gl_FragColor = vec4(finalColor, 1.0);
}
