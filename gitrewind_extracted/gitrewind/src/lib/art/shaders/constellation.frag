// Constellation Shader
precision highp float;

uniform float u_time;
uniform float u_beat;
uniform float u_intensity;
uniform float u_complexity;
uniform vec2 u_resolution;
uniform vec3 u_primaryColor;
uniform vec3 u_secondaryColor;
uniform float u_seed;

// Pseudo-random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233) + u_seed)) * 43758.5453123);
}

// Noise function
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

    // Background gradient
    vec3 bgColor = mix(vec3(0.02, 0.02, 0.05), vec3(0.05, 0.02, 0.08), uv.y);

    // Star field
    float stars = 0.0;
    for (int i = 0; i < 50; i++) {
        vec2 starPos = vec2(
            random(vec2(float(i), 0.0)) * 2.0 - 1.0,
            random(vec2(0.0, float(i))) * 2.0 - 1.0
        ) * 1.5;

        float dist = length(st - starPos);
        float size = 0.003 + random(vec2(float(i), float(i))) * 0.005;

        // Twinkle
        float twinkle = sin(u_time * 2.0 + float(i)) * 0.5 + 0.5;
        twinkle = mix(0.5, 1.0, twinkle);

        // Beat pulse
        float pulse = 1.0 + u_beat * 0.5;
        size *= pulse;

        stars += smoothstep(size, 0.0, dist) * twinkle * u_intensity;
    }

    // Connections between nearby stars
    float connections = 0.0;
    for (int i = 0; i < 30; i++) {
        vec2 starA = vec2(
            random(vec2(float(i), 0.0)) * 2.0 - 1.0,
            random(vec2(0.0, float(i))) * 2.0 - 1.0
        ) * 1.5;

        for (int j = i + 1; j < 30; j++) {
            vec2 starB = vec2(
                random(vec2(float(j), 0.0)) * 2.0 - 1.0,
                random(vec2(0.0, float(j))) * 2.0 - 1.0
            ) * 1.5;

            float starDist = length(starA - starB);
            if (starDist < 0.5 * u_complexity) {
                // Line segment distance
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

    // Nebula glow
    float nebula = noise(st * 2.0 + u_time * 0.1) * 0.3;
    nebula += noise(st * 4.0 - u_time * 0.05) * 0.2;
    nebula *= u_intensity * 0.5;

    // Color mixing
    vec3 starColor = mix(u_primaryColor, u_secondaryColor, stars);
    vec3 connectionColor = u_primaryColor * 0.5;
    vec3 nebulaColor = mix(u_primaryColor, u_secondaryColor, nebula) * 0.3;

    vec3 finalColor = bgColor;
    finalColor += nebulaColor;
    finalColor += connectionColor * connections;
    finalColor += starColor * stars;

    // Vignette
    float vignette = 1.0 - length(st) * 0.3;
    finalColor *= vignette;

    gl_FragColor = vec4(finalColor, 1.0);
}
