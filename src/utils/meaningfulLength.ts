export function countMeaningfulLength(value: string): number {
  return value.replace(/\s/g, '').length;
}

export function truncateByMeaningfulLength(value: string, max: number): string {
  let meaningfulCount = 0;

  for (let i = 0; i < value.length; i++) {
    if (!/\s/.test(value[i])) {
      meaningfulCount++;
      if (meaningfulCount > max) {
        return value.slice(0, i);
      }
    }
  }

  return value;
}