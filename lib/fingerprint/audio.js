// AudioContext fingerprinting: render a short oscillator signal through a
// dynamics compressor in an OfflineAudioContext and hash the output buffer.
// The result differs subtly by audio stack/hardware/OS even though no sound
// is ever actually played (offline rendering never touches real speakers).
export async function collectAudioFingerprint() {
  try {
    const AudioCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!AudioCtx) return null;

    const context = new AudioCtx(1, 5000, 44100);
    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;

    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);

    const buffer = await context.startRendering();
    const data = buffer.getChannelData(0);

    let sum = 0;
    for (let i = 4500; i < data.length; i++) sum += Math.abs(data[i]);
    return sum.toString(36);
  } catch {
    return null;
  }
}
