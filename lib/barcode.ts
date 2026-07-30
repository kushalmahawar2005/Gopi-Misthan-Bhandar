/**
 * Pure TypeScript Code 128-B Barcode Generator
 * Generates SVG and Data URIs for server-side (Node.js/jsPDF) and client-side rendering.
 */

const CODE128_PATTERNS: number[] = [
  212222, 222122, 222221, 121223, 121322, 131222, 122213, 122312, 132212, 221213, // 0-9
  221312, 231212, 112232, 122132, 122231, 113222, 123122, 123221, 223211, 221132, // 10-19
  221231, 213212, 223112, 312131, 311222, 321122, 321221, 312212, 322112, 322211, // 20-29
  212123, 212321, 232121, 111323, 131123, 131321, 112313, 132113, 132311, 211313, // 30-39
  231113, 231311, 112133, 112331, 132131, 113123, 113321, 133121, 313121, 211331, // 40-49
  231131, 213113, 213311, 213131, 311123, 311321, 331121, 312113, 312311, 332111, // 50-59
  314111, 221411, 431111, 111224, 111422, 121124, 121421, 141122, 141221, 112214, // 60-69
  112412, 122114, 122411, 142112, 142211, 241211, 221114, 413111, 241112, 134111, // 70-79
  111242, 121142, 121241, 114212, 124112, 124211, 411212, 421112, 421211, 212141, // 80-89
  214121, 412121, 111143, 111341, 131141, 114113, 114311, 411113, 411311, 113141, // 90-99
  114131, 311141, 411131, 211412, 211214, 211232, 2331112 // 100-106 (Start A/B/C, Stop)
];

const START_B = 104;
const STOP = 106;

export function generateCode128Svg(text: string, height: number = 50, barWidth: number = 2): string {
  const cleanText = text.replace(/[^\x20-\x7E]/g, '');
  if (!cleanText) return '';

  const codes: number[] = [START_B];
  let checksum = START_B;

  for (let i = 0; i < cleanText.length; i++) {
    const code = cleanText.charCodeAt(i) - 32;
    codes.push(code);
    checksum += code * (i + 1);
  }

  checksum %= 103;
  codes.push(checksum);
  codes.push(STOP);

  let totalWidth = 0;
  const bars: { x: number; width: number; color: 'black' | 'white' }[] = [];

  for (const code of codes) {
    const patternStr = String(CODE128_PATTERNS[code]);
    for (let j = 0; j < patternStr.length; j++) {
      const width = parseInt(patternStr[j], 10) * barWidth;
      const isBlack = j % 2 === 0;
      if (isBlack) {
        bars.push({ x: totalWidth, width, color: 'black' });
      }
      totalWidth += width;
    }
  }

  // Quiet zones
  const quietZone = 10 * barWidth;
  const svgWidth = totalWidth + quietZone * 2;

  let rectsSvg = '';
  for (const bar of bars) {
    rectsSvg += `<rect x="${bar.x + quietZone}" y="0" width="${bar.width}" height="${height}" fill="black"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${height}" viewBox="0 0 ${svgWidth} ${height}">
    <rect width="100%" height="100%" fill="white"/>
    ${rectsSvg}
  </svg>`;
}

export function generateCode128DataUri(text: string, height: number = 50, barWidth: number = 2): string {
  const svg = generateCode128Svg(text, height, barWidth);
  if (!svg) return '';
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
