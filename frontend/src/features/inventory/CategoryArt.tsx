import type { Category } from '../../lib/api/types';
import { cn } from '../../lib/cn';
import { PROFILES } from './carProfiles';

/**
 * A wheel drawn like the icon set: two arcs that overshoot where the pen closes the
 * circle, instead of a perfect geometric ring.
 */
function looseCircle(cx: number, cy: number, r: number): string {
  const point = (angle: number, radius: number) =>
    `${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  const start = -0.6;
  return [
    `M${point(start, r)}`,
    `A${r} ${r} 0 1 1 ${point(start + Math.PI, r)}`,
    `A${r * 1.04} ${r * 1.04} 0 1 1 ${point(start + 0.35, r * 1.05)}`,
  ].join(' ');
}

/** A hand-drawn ground line: almost straight, with a slight wander. */
const GROUND = 'M8 86c18-.6 36 .4 56-.2 22-.6 44 .5 66-.1 22-.4 44 .3 64-.2 12-.2 24 0 38 .2';

/**
 * Line drawing shown when a vehicle has no photo (visual identity D.10, D37): an
 * original side profile per body style, drawn in the same hand-drawn style as the
 * icon set. Strokes use currentColor, so the art follows light and dark mode. A
 * faint second pass gives the outline a sketched, pencil-like quality. Decorative:
 * the card text names the car.
 */
export function CategoryArt({
  category,
  compact = false,
}: {
  category: Category;
  compact?: boolean;
}) {
  const { body, glass, wheels, r, cy } = PROFILES[category];
  return (
    <div aria-hidden="true" className="relative size-full bg-plate text-ink-2">
      <svg
        viewBox="0 0 240 100"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          'absolute left-1/2 -translate-x-1/2',
          compact ? 'top-1/2 w-[88%] -translate-y-1/2' : 'top-1/2 w-[78%] -translate-y-[44%]',
        )}
      >
        {!compact && (
          <path d={GROUND} strokeWidth={1.1} opacity={0.55} vectorEffect="non-scaling-stroke" />
        )}
        <path
          d={body}
          strokeWidth={1}
          opacity={0.3}
          transform="translate(0.9 -0.7)"
          vectorEffect="non-scaling-stroke"
        />
        <path d={body} strokeWidth={compact ? 1.3 : 2} vectorEffect="non-scaling-stroke" />
        {glass && (
          <path d={glass} strokeWidth={compact ? 1.1 : 1.5} vectorEffect="non-scaling-stroke" />
        )}
        {wheels.map((cx) => (
          <g key={cx}>
            <path
              d={looseCircle(cx, cy, r * 0.92)}
              strokeWidth={compact ? 1.3 : 2}
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={looseCircle(cx, cy, r * 0.36)}
              strokeWidth={compact ? 1.1 : 1.5}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
