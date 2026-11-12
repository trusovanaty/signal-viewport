/** @jsxImportSource react */

import { PlayButton as PlayButtonPrimitive } from '@videojs/react';

import { PlayIcon, ReplayIcon } from './icons';

/**
 * Large Play over the poster before the first play, and Replay over the last frame once it ends. It is hidden by CSS
 * while playing or paused mid-way, so the video is never covered otherwise.
 */
export function StartButton() {
  return (
    <PlayButtonPrimitive render={<button type="button" />} className="signal-start group/play">
      <PlayIcon className="signal-start-icon group-data-ended/play:hidden" />
      <ReplayIcon className="signal-start-icon hidden group-data-ended/play:block" />
    </PlayButtonPrimitive>
  );
}
