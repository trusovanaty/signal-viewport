/** @jsxImportSource react */

import type { ReactNode, SVGProps } from 'react';

/**
 * One icon family for the transport panel, drawn on a 24px grid: solid shapes for the transport glyphs (play, pause),
 * 2.5px mitered strokes for the rest, all aligned to the same optical size.
 */
function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="miter"
      strokeLinecap="butt"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

export const PlayIcon = (props: IconProps) => (
  <Icon {...props} stroke="none">
    {/* Nudged right by 1px: a triangle's visual center sits left of its bounding box. */}
    <path d="M7 4v16l13-8z" fill="currentColor" />
  </Icon>
);

export const PauseIcon = (props: IconProps) => (
  <Icon {...props} stroke="none">
    <path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z" fill="currentColor" />
  </Icon>
);

export const ReplayIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 4v6h6" />
    <path d="M5.2 10A8 8 0 1 1 4 12.5" />
  </Icon>
);

const Speaker = () => <path d="M3 9.5h4l5-4.5v14l-5-4.5H3z" fill="currentColor" stroke="none" />;

export const VolumeIcon = (props: IconProps) => (
  <Icon {...props}>
    <Speaker />
    <path d="M15.5 9a4.5 4.5 0 0 1 0 6" />
    <path d="M18.5 6a8.5 8.5 0 0 1 0 12" />
  </Icon>
);

export const MutedIcon = (props: IconProps) => (
  <Icon {...props}>
    <Speaker />
    <path d="M16 9.5l5 5M21 9.5l-5 5" />
  </Icon>
);

/** Two sliders: the settings menu holds more than speed. */
export const SettingsIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 7h18M3 17h18" />
    <path d="M8 3.5v7M16 13.5v7" strokeWidth="3" />
  </Icon>
);

export const PipIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.5 5h17v14h-17z" />
    <path d="M12 12h6.5v5.5H12z" fill="currentColor" stroke="none" />
  </Icon>
);

/** Error mark: a square with an exclamation mark, so an error never depends on color (the panel is already red). */
export const AlertIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.5 3.5h17v17h-17z" />
    <path d="M12 7.5v6" />
    <path d="M10.75 15.75h2.5v2.5h-2.5z" fill="currentColor" stroke="none" />
  </Icon>
);

export const FullscreenEnterIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
  </Icon>
);

export const FullscreenExitIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
  </Icon>
);
