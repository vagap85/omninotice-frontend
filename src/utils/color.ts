export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const match = hex.replace(/^#/, '').match(/^(?:([a-f\d])([a-f\d])([a-f\d])|([a-f\d]{2})([a-f\d]{2})([a-f\d]{2}))$/i)
  if (!match) return { r: 0, g: 0, b: 0 }
  if (match[1]) {
    return {
      r: parseInt(match[1] + match[1], 16),
      g: parseInt(match[2]! + match[2], 16),
      b: parseInt(match[3]! + match[3], 16),
    }
  }
  return {
    r: parseInt(match[4]!, 16),
    g: parseInt(match[5]!, 16),
    b: parseInt(match[6]!, 16),
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.min(255, Math.max(0, Math.round(n)))
  return `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, '0')).join('')}`
}
