import type { Category } from '../../lib/api/types';
import { cn } from '../../lib/cn';
import { PROFILES } from './carProfiles';
import { paintFor } from './paint';

/**
 * "Studio plate" shown when a vehicle has no photo (visual identity D.10): an
 * original side profile for its body style, painted in its own colour, standing on a
 * quiet floor. Decorative, since the card text names the car and its colour.
 */
export function CategoryArt({
  category,
  color,
  compact = false,
}: {
  category: Category;
  color: string;
  compact?: boolean;
}) {
  const { body, glass, wheels, r, cy } = PROFILES[category];
  return (
    <div aria-hidden="true" className="relative size-full bg-plate">
      {!compact && (
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[color-mix(in_oklab,var(--plate),var(--ink)_5%)]" />
      )}
      <svg
        viewBox="0 0 240 100"
        className={cn(
          'absolute left-1/2 -translate-x-1/2',
          compact ? 'top-1/2 w-[86%] -translate-y-1/2' : 'bottom-[12%] w-[80%]',
        )}
      >
        <ellipse cx="120" cy={cy + r + 1} rx="104" ry="3" fill="var(--ink)" opacity="0.12" />
        <path
          d={body}
          fill={paintFor(color)}
          stroke="var(--ink)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {glass && <path d={glass} fill="var(--ink)" opacity="0.72" />}
        {wheels.map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={cy} r={r} fill="var(--ink)" />
            <circle cx={cx} cy={cy} r={r * 0.45} fill="#9aa3a7" />
          </g>
        ))}
      </svg>
    </div>
  );
}
