/** @jsxImportSource react */

import {
  Controls,
  FullscreenButton as FullscreenButtonPrimitive,
  PiPButton as PiPButtonPrimitive,
  Time,
  VolumeSlider,
} from '@videojs/react';

import { useCopy } from '../i18n';
import { Button } from './button';
import { FullscreenEnterIcon, FullscreenExitIcon, PipIcon } from './icons';
import { MuteButton } from './mute-button';
import { PlayButton } from './play-button';
import { SettingsMenu } from './settings-menu';
import { TimeRuler } from './time-ruler';

function FullscreenButton() {
  return (
    <FullscreenButtonPrimitive render={<Button />} className="group/fullscreen">
      <FullscreenEnterIcon className="signal-icon col-start-1 row-start-1 hidden group-not-data-fullscreen/fullscreen:block" />
      <FullscreenExitIcon className="signal-icon col-start-1 row-start-1 hidden group-data-fullscreen/fullscreen:block" />
    </FullscreenButtonPrimitive>
  );
}

/** Rendered only where the browser offers picture-in-picture (the primitive returns nothing otherwise). */
function PiPButton() {
  return (
    <PiPButtonPrimitive render={<Button className="signal-pip" />}>
      <PipIcon className="signal-icon" />
    </PiPButtonPrimitive>
  );
}

function Volume() {
  const copy = useCopy();
  return (
    <Controls.Group className="signal-volume" aria-label={copy.volume}>
      <MuteButton />
      <VolumeSlider.Root className="signal-volume-slider">
        <VolumeSlider.Track className="signal-rail">
          <VolumeSlider.Fill className="signal-rail-fill" />
        </VolumeSlider.Track>
        <VolumeSlider.Thumb className="signal-volume-thumb" />
      </VolumeSlider.Root>
    </Controls.Group>
  );
}

/**
 * The transport panel under the viewport: play | timeline | time | cluster (volume, settings, picture-in-picture,
 * fullscreen). Children are in reading order, which is also the focus order; the narrow layout only moves cells in
 * the grid. The cluster's optional controls (settings sections, PiP) come and go without moving the other cells.
 */
export function Panel() {
  return (
    <Controls.Root visibility="always">
      <Controls.Content className="signal-panel">
        {/* Two rows on narrow players, one row on wide ones (the rows then use `display: contents`). */}
        <div className="signal-row signal-row--a">
          <div className="signal-cell--play">
            <PlayButton />
          </div>
          <div className="signal-cell--ruler">
            <TimeRuler />
          </div>
        </div>
        <div className="signal-row signal-row--b">
          <Time.Group className="signal-time">
            <Time.Value type="current" />
            <Time.Separator />
            <Time.Value type="duration" />
          </Time.Group>
          <div className="signal-cell--cluster">
            <Volume />
            <SettingsMenu />
            <PiPButton />
            <FullscreenButton />
          </div>
        </div>
      </Controls.Content>
    </Controls.Root>
  );
}
