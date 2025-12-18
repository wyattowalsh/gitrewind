// Flow Field Shader
precision highp float;

uniform float u_time;
uniform float u_beat;
uniform float u_intensity;
uniform float u_complexity;
uniform vec2 u_resolution;
uniform vec3 u_primaryColor;
uniform vec3 u_secondaryColor;
uniform float u_seed;

// Simplex noise functions
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
    m = m*m;
    m = m*m;
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

    // Background
    vec3 bgColor = vec3(0.02, 0.02, 0.04);

    // Flow field
    float scale = 2.0 + u_complexity * 2.0;
    float speed = 0.3 + u_beat * 0.2;

    // Multiple layers of flow
    float flow = 0.0;
    vec2 flowDir = vec2(0.0);

    for (int i = 0; i < 3; i++) {
        float layerScale = scale * (1.0 + float(i) * 0.5);
        float layerTime = u_time * speed * (1.0 - float(i) * 0.2);

        vec2 pos = st * layerScale + vec2(layerTime, 0.0);
        float n = snoise(pos + u_seed);

        flow += n * (1.0 / float(i + 1));

        // Calculate flow direction
        float angle = n * 3.14159 * 2.0;
        flowDir += vec2(cos(angle), sin(angle)) * (1.0 / float(i + 1));
    }

    flow = flow * 0.5 + 0.5;

    // Particles following flow
    float particles = 0.0;
    for (int i = 0; i < 100; i++) {
        float fi = float(i);
        vec2 particleStart = vec2(
            fract(sin(fi * 12.9898 + u_seed) * 43758.5453) * 2.0 - 1.0,
            fract(sin(fi * 78.233 + u_seed) * 43758.5453) * 2.0 - 1.0
        ) * 1.5;

        // Move particle along flow
        float t = mod(u_time * 0.5 + fi * 0.1, 3.0);
        vec2 particlePos = particleStart + flowDir * t * 0.5;

        float dist = length(st - particlePos);
        float size = 0.005 + u_beat * 0.003;
        particles += smoothstep(size, 0.0, dist) * u_intensity;
    }

    // Color gradient based on flow
    vec3 flowColor = mix(u_primaryColor, u_secondaryColor, flow);
    flowColor *= 0.3 + flow * 0.7;

    // Particle color
    vec3 particleColor = mix(u_primaryColor, vec3(1.0), 0.5) * particles;

    // Combine
    vec3 finalColor = bgColor;
    finalColor += flowColor * 0.3;
    finalColor += particleColor;

    // Glow effect
    finalColor += flowColor * pow(flow, 3.0) * u_intensity * 0.5;

    // Beat pulse
    finalColor *= 1.0 + u_beat * 0.2;

    // Vignette
    float vignette = 1.0 - length(st) * 0.3;
    finalColor *= vignette;

    gl_FragColor = vec4(finalColor, 1.0);
}
