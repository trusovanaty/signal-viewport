import { MuxVideo } from '@videojs/react/media/mux-video';
import { VideoPlayer } from '@videojs/react/video';

import { VideoSkin } from '@/video/skin';

import type { PlaybackProps } from '../shell/params';

// What the preview plays. Change these to try the skin with your own media; any Mux or HLS URL works.
const SRC = 'https://stream.mux.com/83EzHOvVzVN01AsrD01BCpiH02Pj3S8mfzBOu101w2nHC5s.m3u8';
const POSTER = 'https://image.mux.com/83EzHOvVzVN01AsrD01BCpiH02Pj3S8mfzBOu101w2nHC5s/thumbnail.webp?time=69';
/** Shown in the skin's title strip. Replace with your own video's title. */
export const TITLE = 'Cosmic Dawn: sample stream';
/**
 * What the demo page prints under the player. `author` and `about` stay null until the real film is known: the page
 * shows only what is filled in here, so nothing is invented. Replace SRC, POSTER and TITLE above together with this.
 */
export const MATERIAL: { author: string | null; about: string | null; isDemo: boolean } = {
  author: null,
  about: 'Sample stream from Mux, used here as demo footage.',
  isDemo: true,
};
/** Chapters for the time slider, served from `apps/preview/public`. */
const CHAPTERS = './cosmic-dawn-chapters.vtt';

/** `media` carries the workbench's playback options: autoplay, muted, loop, and preload. */
export function Player({ media }: { media?: PlaybackProps }) {
  return (
    <VideoPlayer title={TITLE} poster={POSTER}>
      <VideoSkin>
        <MuxVideo {...media} src={SRC} playsInline crossOrigin="">
          <track kind="chapters" label="English" srcLang="en" src={CHAPTERS} default />
        </MuxVideo>
      </VideoSkin>
    </VideoPlayer>
  );
}
