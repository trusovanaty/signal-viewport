/** @jsxImportSource react */

import { PlayButton as PlayButtonPrimitive } from '@videojs/react';

import { cn } from '@/lib/resolve-class-name';

import { Button } from './button';
import { PauseIcon, PlayIcon, ReplayIcon } from './icons';

export function PlayButton() {
  return (
    <PlayButtonPrimitive render={<Button className="signal-btn--play" />} className="group/play">
      <ReplayIcon className={cn('signal-icon col-start-1 row-start-1 hidden', 'group-data-ended/play:block')} />
      <PlayIcon
        className={cn(
          'signal-icon col-start-1 row-start-1 hidden',
          'group-not-data-ended/play:group-data-paused/play:block',
          'group-not-data-ended/play:group-not-data-started/play:block'
        )}
      />
      <PauseIcon
        className={cn(
          'signal-icon col-start-1 row-start-1 hidden',
          'group-data-started/play:group-not-data-paused/play:group-not-data-ended/play:block'
        )}
      />
    </PlayButtonPrimitive>
  );
}
