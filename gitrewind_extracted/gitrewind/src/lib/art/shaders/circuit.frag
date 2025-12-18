// Circuit Board Shader - Tech-inspired generative art
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

// Hash functions for procedural generation
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float hash(float n) {
  return fract(sin(n) * 43758.5453);
}

// Grid-based circuit pattern
float circuit(vec2 uv, float scale) {
  vec2 grid = fract(uv * scale);
  vec2 id = floor(uv * scale);

  float h = hash(id);
  float lineWidth = 0.08 + u_intensity * 0.04;

  // Horizontal and vertical lines
  float hLine = smoothstep(lineWidth, 0.0, abs(grid.y - 0.5));
  float vLine = smoothstep(lineWidth, 0.0, abs(grid.x - 0.5));

  // Decide which lines to show based on hash
  float pattern = 0.0;
  if (h > 0.3) pattern += hLine * step(0.2, grid.x) * step(grid.x, 0.8);
  if (h > 0.5) pattern += vLine * step(0.2, grid.y) * step(grid.y, 0.8);

  // Add corner connectors
  float cornerSize = 0.15;
  if (h > 0.7) {
    vec2 corner = step(vec2(1.0 - cornerSize), grid) + step(grid, vec2(cornerSize));
    pattern += max(corner.x, corner.y) * 0.5;
  }

  return pattern;
}

// Node/junction points
float nodes(vec2 uv, float scale) {
  vec2 grid = fract(uv * scale);
  vec2 id = floor(uv * scale);

  float h = hash(id + 0.5);

  if (h > 0.6) {
    float dist = length(grid - 0.5);
    float nodeSize = 0.08 + u_beat * 0.04;

    // Pulsing node
    float pulse = 1.0 + sin(u_time * 3.0 + h * 10.0) * 0.3 * u_momentum;
    return smoothstep(nodeSize * pulse, 0.0, dist);
  }

  return 0.0;
}

// Data flow animation along circuits
float dataFlow(vec2 uv, float scale) {
  vec2 grid = fract(uv * scale);
  vec2 id = floor(uv * scale);

  float h = hash(id);
  float speed = 2.0 + h * 3.0;
  float t = fract(u_time * speed * 0.1);

  // Horizontal flow
  if (h > 0.4 && abs(grid.y - 0.5) < 0.1) {
    float flowPos = fract(grid.x - t);
    float packet = smoothstep(0.0, 0.1, flowPos) * smoothstep(0.3, 0.2, flowPos);
    return packet * u_intensity;
  }

  // Vertical flow
  if (h > 0.6 && abs(grid.x - 0.5) < 0.1) {
    float flowPos = fract(grid.y - t);
    float packet = smoothstep(0.0, 0.1, flowPos) * smoothstep(0.3, 0.2, flowPos);
    return packet * u_intensity;
  }

  return 0.0;
}

// Glowing effect
vec3 glow(vec3 color, float amount) {
  return color + color * amount * u_beat;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 centeredUv = uv - 0.5;

  // Scale based on complexity
  float baseScale = 8.0 + u_complexity * 12.0;

  // Slight rotation over time
  float angle = u_time * 0.02 * u_momentum;
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 rotUv = rot * centeredUv + 0.5;

  // Layer multiple circuit scales
  float circuitPattern = 0.0;
  circuitPattern += circuit(rotUv, baseScale) * 0.6;
  circuitPattern += circuit(rotUv + 0.33, baseScale * 0.5) * 0.3;
  circuitPattern += circuit(rotUv + 0.66, baseScale * 2.0) * 0.2;

  // Add nodes
  float nodePattern = nodes(rotUv, baseScale);

  // Add data flow
  float flow = dataFlow(rotUv, baseScale);

  // Background gradient
  float bgGradient = 1.0 - length(centeredUv) * 0.8;
  vec3 bgColor = mix(vec3(0.02, 0.02, 0.05), vec3(0.05, 0.08, 0.12), bgGradient);

  // Circuit color with primary/secondary mix
  vec3 circuitColor = mix(u_primaryColor * 0.6, u_secondaryColor, circuitPattern);

  // Node glow color
  vec3 nodeColor = glow(u_primaryColor, 2.0) * nodePattern;

  // Data flow color (bright accent)
  vec3 flowColor = vec3(1.0, 1.0, 1.0) * flow * 2.0;

  // Combine layers
  vec3 color = bgColor;
  color = mix(color, circuitColor, circuitPattern * 0.8);
  color += nodeColor;
  color += flowColor;

  // Add subtle scan line effect
  float scanLine = sin(uv.y * u_resolution.y * 0.5 + u_time * 2.0) * 0.02;
  color += scanLine;

  // Vignette
  float vignette = 1.0 - length(centeredUv) * 0.6;
  color *= vignette;

  // Beat pulse effect
  color *= 1.0 + u_beat * 0.3;

  gl_FragColor = vec4(color, 1.0);
}
