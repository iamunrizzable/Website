// WebGL fingerprinting: GPU vendor/renderer strings, supported extensions,
// and a hash of a rendered test scene's pixel readback. All three vary by
// GPU + driver + OS, independent of the canvas 2D signal above.
export function collectWebglFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;

    let vendor = null;
    let renderer = null;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }

    const extensions = (gl.getSupportedExtensions() || []).slice().sort();

    // Render a small test scene and read back pixels — driver/GPU-specific
    // rasterization differences show up here even when vendor/renderer
    // strings are masked (Chrome increasingly restricts those by default).
    canvas.width = 64;
    canvas.height = 64;
    gl.viewport(0, 0, 64, 64);
    gl.clearColor(0.2, 0.4, 0.6, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vsSource = 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }';
    const fsSource = 'precision mediump float; void main() { gl_FragColor = vec4(0.8, 0.3, 0.5, 1.0); }';
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 0, 1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const pixels = new Uint8Array(64 * 64 * 4);
    gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    // Downsample to a short string rather than shipping 16KB of raw pixels.
    let pixelSum = 0;
    for (let i = 0; i < pixels.length; i += 97) pixelSum = (pixelSum * 31 + pixels[i]) >>> 0;

    return {
      vendor: vendor ? String(vendor) : null,
      renderer: renderer ? String(renderer) : null,
      extensions,
      pixelHash: pixelSum.toString(16),
    };
  } catch {
    return null;
  }
}
