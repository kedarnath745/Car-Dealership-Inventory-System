import type { ReactNode, SVGProps } from 'react';

/**
 * Showroom's own icon set, drawn by hand for this project (no third-party icon
 * library). Strokes bow slightly, ends are round and circles overlap where the pen
 * closes them, so the icons read as drawn rather than generated. All icons share one
 * 24×24 grid and stroke weight, and inherit `currentColor`. Decorative by default
 * (aria-hidden); give the surrounding control an accessible name instead.
 */
export type IconProps = SVGProps<SVGSVGElement>;

function createIcon(displayName: string, paths: ReactNode) {
  function Icon({ strokeWidth = 1.7, ...props }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...props}
      >
        {paths}
      </svg>
    );
  }
  Icon.displayName = displayName;
  return Icon;
}

/** A small filled dot (for "i" and "!"), drawn as a short round-capped stroke. */
const dot = (cx: number, cy: number) => <path d={`M${cx} ${cy}h.01`} strokeWidth={2.4} />;

const looseCircle =
  'M20.1 11.2c.5 4.5-2.9 8.6-7.6 8.9-4.5.4-8.3-2.9-8.6-7.4C3.6 8.1 7 4.2 11.5 3.9c4.2-.3 7.8 2.4 8.6 6.4';
const lens =
  'M15.9 9.6c.5 3.2-1.7 6.4-5.1 6.8-3.3.4-6.1-1.9-6.4-5.2-.3-3.4 2.1-6.2 5.4-6.4 2.9-.2 5.3 1.6 6 4.2';

export const SearchIcon = createIcon(
  'SearchIcon',
  <>
    <path d={lens} />
    <path d="M15.3 15.4c1.4 1.2 2.9 2.6 4.4 4.3" />
  </>,
);

export const NoResultsIcon = createIcon(
  'NoResultsIcon',
  <>
    <path d={lens} />
    <path d="M15.3 15.4c1.4 1.2 2.9 2.6 4.4 4.3" />
    <path d="M8.5 8.7c1.3 1.2 2.6 2.5 3.8 3.8M12.3 8.6c-1.2 1.3-2.5 2.6-3.9 3.9" />
  </>,
);

export const CloseIcon = createIcon(
  'CloseIcon',
  <path d="M6.2 6.4c3.6 3.4 7.6 7.4 11.5 11.3M17.6 6.1c-3.5 3.9-7.5 7.8-11.2 11.6" />,
);

export const PlusIcon = createIcon(
  'PlusIcon',
  <path d="M12.1 5.2c-.2 4.6-.1 9.2.1 13.7M5.3 12.2c4.5-.3 9-.2 13.4.1" />,
);

export const MinusIcon = createIcon('MinusIcon', <path d="M5.4 12.3c4.4-.4 8.9-.3 13.3 0" />);

export const CaretDownIcon = createIcon(
  'CaretDownIcon',
  <path d="M6.6 9.4c1.8 1.9 3.6 3.7 5.5 5.4 1.9-1.8 3.8-3.6 5.4-5.6" />,
);

export const AlertIcon = createIcon(
  'AlertIcon',
  <>
    <path d={looseCircle} />
    <path d="M12 7.9c-.1 1.6-.1 3.2.1 4.8" />
    {dot(12.05, 16.1)}
  </>,
);

export const InfoIcon = createIcon(
  'InfoIcon',
  <>
    <path d={looseCircle} />
    <path d="M12 11.1c.1 1.8.1 3.5-.1 5.2" />
    {dot(12, 7.9)}
  </>,
);

export const SignOutIcon = createIcon(
  'SignOutIcon',
  <>
    <path d="M10 4.6c-1.7 0-3.3 0-4.8.2-.6.1-.9.5-.9 1.1-.1 4-.1 8.1 0 12.1 0 .6.4 1 1 1 1.5.1 3.1.1 4.7.1" />
    <path d="M10.3 12.1c3.1-.1 6.2-.1 9.3.1" />
    <path d="M16.6 8.7c1.1 1.1 2.1 2.2 3.1 3.4-1 1.1-2 2.2-3.1 3.3" />
  </>,
);

export const PencilIcon = createIcon(
  'PencilIcon',
  <>
    <path d="M14.9 5.6c.9-.9 2.2-.9 3 0l.6.6c.9.8.9 2.1 0 3L9.3 18.4c-1.3.4-2.7.8-4 1.1.3-1.4.7-2.7 1.1-4z" />
    <path d="M13.3 7.3c1.2 1 2.3 2.1 3.3 3.3" />
  </>,
);

export const TrashIcon = createIcon(
  'TrashIcon',
  <>
    <path d="M4.6 6.8c4.9-.3 9.8-.3 14.8 0" />
    <path d="M9.4 6.6c.1-1 .2-1.9.5-2.6 1.4-.2 2.8-.2 4.2 0 .3.7.4 1.6.5 2.6" />
    <path d="M6.4 7.1c.3 3.9.6 7.9 1 11.8.1.8.7 1.3 1.5 1.3 2.1.1 4.2.1 6.3 0 .8 0 1.4-.6 1.5-1.4.3-3.9.6-7.8.9-11.7" />
    <path d="M10.2 10.6c.1 2 .2 4 .3 5.9M13.8 10.6c-.1 2-.2 4-.3 5.9" />
  </>,
);

export const ReceiptIcon = createIcon(
  'ReceiptIcon',
  <>
    <path d="M6.3 3.9c3.8-.2 7.6-.2 11.4 0 .2 5.4.2 10.8 0 16.2l-1.9-1.3-1.9 1.3-1.9-1.3-1.9 1.3-1.9-1.3-1.9 1.3c-.2-5.4-.2-10.8 0-16.2z" />
    <path d="M9 8.6c2-.1 4-.1 6 .1M9 12.1c2-.1 4-.1 6 0M9 15.5c1.2 0 2.4-.1 3.6 0" />
  </>,
);

export const RetryIcon = createIcon(
  'RetryIcon',
  <>
    <path d="M19.3 12.6c-.3 4-3.7 7.1-7.7 6.9-4.1-.1-7.3-3.6-7.1-7.7.2-4 3.6-7.2 7.6-7 2.4.1 4.4 1.3 5.7 3.1" />
    <path d="M18.6 4.4c.2 1.4.2 2.8.1 4.2-1.4.1-2.8.1-4.2 0" />
  </>,
);

export const SlidersIcon = createIcon(
  'SlidersIcon',
  <>
    <path d="M4.4 7.2c1.1 0 2.2 0 3.2.1M11.2 7.3c2.8-.1 5.6-.1 8.4 0" />
    <path d="M9.4 5.4c1.1 0 1.9.9 1.9 1.9 0 1.1-.9 1.9-1.9 1.9-1 0-1.9-.8-1.9-1.8-.1-1 .8-2 1.9-2z" />
    <path d="M4.4 16.7c3.1-.1 6.2-.1 9.2.1M17.2 16.8c.8 0 1.6 0 2.4-.1" />
    <path d="M15.4 14.9c1.1 0 1.9.9 1.9 1.9 0 1.1-.9 1.9-1.9 1.9-1 0-1.9-.8-1.9-1.8-.1-1 .8-2 1.9-2z" />
  </>,
);

export const RestockIcon = createIcon(
  'RestockIcon',
  <>
    <path d="M4.5 8.3c.1 3.5.1 7 0 10.4 0 .7.5 1.2 1.2 1.2 4.2.1 8.4.1 12.6 0 .7 0 1.2-.5 1.2-1.2-.1-3.4-.1-6.9 0-10.4" />
    <path d="M3.9 8.2c.5-1.2 1.1-2.4 1.8-3.6 4-.2 7.9-.2 11.8 0 .8 1.2 1.5 2.4 2.1 3.6-5.2.2-10.4.2-15.7 0z" />
    <path d="M12 11.3c-.1 1.8-.1 3.6 0 5.4M9.3 14c1.8-.1 3.6-.1 5.4 0" />
  </>,
);

export const CarIcon = createIcon(
  'CarIcon',
  <>
    <path d="M4.4 15.6c-.2-1.3 0-2.6.6-3.6l1.6-4.2c.4-1 1.2-1.5 2.2-1.6 2.2-.2 4.4-.2 6.5 0 1 .1 1.8.7 2.2 1.6l1.7 4.2c.5 1.1.7 2.3.5 3.6" />
    <path d="M4.3 15.4c5.1.4 10.3.4 15.4 0" />
    <path d="M6.2 15.8c0 1 .1 1.9.2 2.8.6.1 1.2.1 1.8 0 .1-.8.1-1.6.1-2.5M17.8 15.8c0 1 0 1.9-.1 2.8-.6.1-1.2.1-1.8 0-.1-.8-.1-1.6-.1-2.5" />
    <path d="M6.3 10.6c3.8-.3 7.6-.3 11.4 0" />
    <path d="M7.4 12.9h1.2M15.4 12.9h1.2" />
  </>,
);
