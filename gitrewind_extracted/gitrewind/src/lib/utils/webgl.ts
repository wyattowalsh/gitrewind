// WebGL Detection and Support Utilities

export interface WebGLSupport {
  webgl1: boolean;
  webgl2: boolean;
  supported: boolean;
  version: 1 | 2 | null;
  renderer: string | null;
  vendor: string | null;
  maxTextureSize: number | null;
  maxViewportDims: number[] | null;
}

/**
 * Detect WebGL support and capabilities
 */
export function detectWebGLSupport(): WebGLSupport {
  const result: WebGLSupport = {
    webgl1: false,
    webgl2: false,
    supported: false,
    version: null,
    renderer: null,
    vendor: null,
    maxTextureSize: null,
    maxViewportDims: null,
  };

  // Try to create a canvas and get WebGL context
  const canvas = document.createElement('canvas');

  // Try WebGL2 first
  try {
    const gl2 = canvas.getContext('webgl2');
    if (gl2) {
      result.webgl2 = true;
      result.supported = true;
      result.version = 2;

      // Get debug info if available
      const debugInfo = gl2.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        result.renderer = gl2.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        result.vendor = gl2.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      }

      result.maxTextureSize = gl2.getParameter(gl2.MAX_TEXTURE_SIZE);
      result.maxViewportDims = gl2.getParameter(gl2.MAX_VIEWPORT_DIMS);
    }
  } catch {
    // WebGL2 not available
  }

  // Try WebGL1 as fallback
  if (!result.webgl2) {
    try {
      const gl1 =
        canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl');
      if (gl1) {
        result.webgl1 = true;
        result.supported = true;
        result.version = 1;

        const glContext = gl1 as WebGLRenderingContext;
        const debugInfo = glContext.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          result.renderer = glContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          result.vendor = glContext.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        }

        result.maxTextureSize = glContext.getParameter(glContext.MAX_TEXTURE_SIZE);
        result.maxViewportDims = glContext.getParameter(glContext.MAX_VIEWPORT_DIMS);
      }
    } catch {
      // WebGL1 not available
    }
  }

  return result;
}

/**
 * Check if WebGL is supported (cached result)
 */
let cachedSupport: WebGLSupport | null = null;

export function isWebGLSupported(): boolean {
  if (typeof window === 'undefined') return false;

  if (!cachedSupport) {
    cachedSupport = detectWebGLSupport();
  }

  return cachedSupport.supported;
}

/**
 * Get WebGL support details (cached result)
 */
export function getWebGLSupport(): WebGLSupport {
  if (typeof window === 'undefined') {
    return {
      webgl1: false,
      webgl2: false,
      supported: false,
      version: null,
      renderer: null,
      vendor: null,
      maxTextureSize: null,
      maxViewportDims: null,
    };
  }

  if (!cachedSupport) {
    cachedSupport = detectWebGLSupport();
  }

  return cachedSupport;
}

/**
 * Check if running on mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if device has low performance indicators
 */
export function isLowPerformanceDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const support = getWebGLSupport();

  // Check for software renderers or known low-performance GPUs
  const lowPerfIndicators = [
    'SwiftShader',
    'llvmpipe',
    'Software',
    'Microsoft Basic Render',
  ];

  if (support.renderer) {
    for (const indicator of lowPerfIndicators) {
      if (support.renderer.toLowerCase().includes(indicator.toLowerCase())) {
        return true;
      }
    }
  }

  // Check for small max texture size (indicates low-end GPU)
  if (support.maxTextureSize && support.maxTextureSize < 4096) {
    return true;
  }

  // Check for low device memory (if available)
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.deviceMemory && nav.deviceMemory < 4) {
    return true;
  }

  return false;
}
