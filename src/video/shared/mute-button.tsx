/** @jsxImportSource react */

import { MuteButton as MuteButtonPrimitive } from '@videojs/react';

import { Button } from './button';
import { MutedIcon, VolumeIcon } from './icons';

export function MuteButton() {
  return (
    <MuteButtonPrimitive render={<Button />} className="group/mute">
      <MutedIcon className="signal-icon col-start-1 row-start-1 hidden group-data-muted/mute:block" />
      <VolumeIcon className="signal-icon col-start-1 row-start-1 hidden group-not-data-muted/mute:block" />
    </MuteButtonPrimitive>
  );
}
