export function getIconBackgroundColor(
  iconColor: string,
  bgIconColor?: string
): string {
  return (
    bgIconColor?.trim() || `color-mix(in srgb, ${iconColor} 25%, white)`
  );
}
