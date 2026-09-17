// Canvas fingerprinting: render known text/shapes to an offscreen canvas and
// read back the pixel data as a data URL. Subpixel rendering, anti-aliasing,
// and font-hinting differ subtly by GPU + driver + OS + browser, making the
// output a high-entropy signal that's stable for a given device/browser
// install but not reproducible from device specs alone.
export function collectCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial"';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 100, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('TJB fingerprint canvas 🔒', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.font = '18px "Georgia"';
    ctx.fillText('device check 1.0', 4, 35);

    ctx.strokeStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(60, 45, 10, 0, Math.PI * 2, true);
    ctx.stroke();

    return canvas.toDataURL();
  } catch {
    return null;
  }
}
