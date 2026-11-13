/** @jsxImportSource react */

import type { ReactNode, SVGProps } from 'react';

/**
 * One icon family, built from the ruler's own parts: a 2px track, a tick, a solid triangle pin and a square plate. Drawn
 * on a 24px grid, solid shapes only, sharp corners, no curves (the cross is two straight bars).
 */
function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

export const PlayIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 4v16l13-8z" />
  </Icon>
);

export const PauseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z" />
  </Icon>
);

/** Back to the start: a tick and a pin pointing at it. */
export const ReplayIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 4h2.5v16H4zM20 4v16L8 12z" />
  </Icon>
);

const Speaker = () => <path d="M3 9h4l5-4v14l-5-4H3z" />;

/** The level as two ticks of different height, like the ruler's. */
export const VolumeIcon = (props: IconProps) => (
  <Icon {...props}>
    <Speaker />
    <path d="M15.25 9h2.5v6h-2.5zM18.75 6h2.5v12h-2.5z" />
  </Icon>
);

/** A speaker and a cross of two straight bars, clearly apart from the speaker. */
export const MutedIcon = (props: IconProps) => (
  <Icon {...props}>
    <Speaker />
    <path d="M13.79 9.21l1.42-1.42 7 7-1.42 1.42zM22.21 9.21l-1.42-1.42-7 7 1.42 1.42z" />
  </Icon>
);

/** Three tracks with a pin on each, like the ruler's own pin: the settings menu holds more than speed. */
export const SettingsIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 6h18v2H3zM3 12h18v2H3zM3 18h18v2H3z" />
    <path d="M5 3h6L8 6zM12 9h6l-3 3zM8 15h6l-3 3z" />
  </Icon>
);

export const PipIcon = (props: IconProps) => (
  <Icon {...props}>
    <path fillRule="evenodd" d="M3 5h18v14H3zM5 7v10h14V7z" />
    <path d="M12 11h6v5h-6z" />
  </Icon>
);

/** Error mark: a square with an exclamation mark, so an error never depends on color (the panel is already red). */
export const AlertIcon = (props: IconProps) => (
  <Icon {...props}>
    <path fillRule="evenodd" d="M3 3h18v18H3zM5 5v14h14V5z" />
    <path d="M11 7h2v6h-2zM11 15h2v2h-2z" />
  </Icon>
);

export const FullscreenEnterIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 3h6v2H5v4H3zM15 3h6v6h-2V5h-4zM21 15v6h-6v-2h4v-4zM9 21H3v-6h2v4h4z" />
  </Icon>
);

export const FullscreenExitIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 3v4H3v2h6V3zM15 3v6h6V7h-4V3zM21 15h-6v6h2v-4h4zM3 15v2h4v4h2v-6z" />
  </Icon>
);
