/**
 * Maps a vehicle's free-text colour to a paint swatch for its studio-plate drawing
 * (visual identity D.10). Keywords are checked in order, so specific shades such as
 * "wine" are matched before the generic "red".
 */
const PAINTS: ReadonlyArray<[keywords: readonly string[], paint: string]> = [
  [['maroon', 'wine', 'burgundy'], '#6D1F2A'],
  [['white', 'pearl'], '#F2F2EF'],
  [['black'], '#1D1F21'],
  [['silver'], '#B9BEC2'],
  [['grey', 'gray', 'graphite'], '#7D858A'],
  [['red'], '#B3261E'],
  [['blue'], '#2B4C7E'],
  [['green'], '#2F5D46'],
  [['brown', 'bronze'], '#6B4A35'],
  [['beige', 'gold', 'champagne'], '#CDBB9B'],
  [['yellow'], '#E0B53A'],
  [['orange'], '#D2691E'],
];

export const FALLBACK_PAINT = '#9AA3A7';

export function paintFor(color: string): string {
  const name = color.toLowerCase();
  return (
    PAINTS.find(([keywords]) => keywords.some((word) => name.includes(word)))?.[1] ?? FALLBACK_PAINT
  );
}
