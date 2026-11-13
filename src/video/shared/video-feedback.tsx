/** @jsxImportSource react */

import { Poster as PosterPrimitive } from '@videojs/react';
import { BufferingIndicator as BufferingIndicatorPrimitive, Controls } from '@videojs/react';
import type { ClassValue } from 'cn';

import { cn, resolveClassName } from '@/lib/resolve-class-name';

export function Poster({ renderImage }: { renderImage?: PosterPrimitive.ImageProps['render'] } = {}) {
  return (
    <PosterPrimitive.Root className={'absolute inset-0 size-full not-data-visible:hidden'}>
      <PosterPrimitive.Image render={renderImage} className={'size-full object-media'} />
    </PosterPrimitive.Root>
  );
}

export function BufferingIndicator({ className }: { className?: ClassValue } = {}) {
  return (
    <BufferingIndicatorPrimitive
      className={(state) =>
        cn(
          'pointer-events-none absolute inset-0 grid place-items-center not-data-visible:hidden not-data-visible:[--media-spinner-animation:none] motion-reduce:[--media-spinner-animation:none]',
          resolveClassName(className, state)
        )
      }
    >
      {/* The skin's own loading mark: a short piece of the ruler, with the pin stepping along its ticks. Black plate: it
          keeps its contrast over a bright frame. The motion stops with prefers-reduced-motion (see signal.css). */}
      <svg className="signal-loading" viewBox="0 0 64 64" width="96" height="96" aria-hidden="true" focusable="false">
        <rect x="14" y="38" width="38" height="2" />
        <rect x="14" y="26" width="2" height="12" />
        <rect x="50" y="26" width="2" height="12" />
        {[20, 26, 32, 38, 44].map((x) => (
          <rect key={x} x={x} y="32" width="2" height="6" />
        ))}
        <g className="signal-loading-pin">
          <path d="M9 21h12l-5 7v11h-2V28z" />
        </g>
      </svg>
    </BufferingIndicatorPrimitive>
  );
}

export function VideoBufferingIndicator() {
  return (
    <Controls.Group className={'group/buffering-controls contents'}>
      <BufferingIndicator
        className={'z-40 group-not-data-visible/buffering-controls:bg-[rgba(0,0,0,0.4)] forced-colors:bg-transparent!'}
      />
    </Controls.Group>
  );
}
