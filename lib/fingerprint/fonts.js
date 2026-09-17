// Font detection via the classic width-comparison technique: measure text
// width for each candidate font against three baseline (near-universal)
// fonts. If a candidate's measured width differs from ALL three baselines,
// the browser substituted a different font for it, which only happens if
// that font is actually installed.
const BASELINE_FONTS = ['monospace', 'sans-serif', 'serif'];

const CANDIDATE_FONTS = [
  'Arial', 'Arial Black', 'Arial Narrow', 'Calibri', 'Cambria', 'Candara',
  'Comic Sans MS', 'Consolas', 'Courier New', 'Georgia', 'Helvetica',
  'Impact', 'Lucida Console', 'Lucida Sans Unicode', 'Palatino Linotype',
  'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
  'Roboto', 'Noto Sans', 'Ubuntu', 'Cantarell', 'DejaVu Sans',
];

const TEST_STRING = 'mmmmmmmmmmlliB0123456789';
const TEST_SIZE = '72px';

export function collectInstalledFonts() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    const baselineWidths = {};
    for (const base of BASELINE_FONTS) {
      ctx.font = `${TEST_SIZE} ${base}`;
      baselineWidths[base] = ctx.measureText(TEST_STRING).width;
    }

    const installed = [];
    for (const font of CANDIDATE_FONTS) {
      let differsFromAllBaselines = true;
      for (const base of BASELINE_FONTS) {
        ctx.font = `${TEST_SIZE} "${font}", ${base}`;
        const width = ctx.measureText(TEST_STRING).width;
        if (width === baselineWidths[base]) {
          differsFromAllBaselines = false;
          break;
        }
      }
      if (differsFromAllBaselines) installed.push(font);
    }
    return installed.sort();
  } catch {
    return [];
  }
}
