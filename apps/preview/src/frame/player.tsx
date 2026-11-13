import { Video, VideoPlayer } from '@videojs/react/video';

import { VideoSkin } from '@/video/skin';

import type { PlaybackProps } from '../shell/params';

// What the preview plays. Change these to try the skin with your own media. This demo is a plain MP4 served from
// `apps/preview/public/media`; a Mux or HLS source works too (see the README for the MuxVideo example).
const SRC = './media/scarlet-walk.mp4';
const POSTER = './media/poster.webp';
/** Shown in the skin's title strip. Replace with your own video's title. */
export const TITLE = 'Scarlet Walk';
/**
 * What the demo page prints under the player. `author` and `about` stay null until the real film is known: the page
 * shows only what is filled in here, so nothing is invented. Replace SRC, POSTER and TITLE above together with this.
 */
export const MATERIAL: { author: string | null; about: string | null; isDemo: boolean } = {
  author: null,
  about: 'An AI-generated fashion film (Kling 2.6 Pro, made through Flora), used here as demo footage.',
  isDemo: true,
};
/** Tracks served from `apps/preview/public/media`: chapters, captions, and a ruler preview storyboard (a sprite sheet). */
const CHAPTERS = './media/chapters.vtt';
const CAPTIONS = './media/captions.vtt';
const THUMBNAILS = './media/thumbs.vtt';

/** A video the visitor opened from their own computer: a blob address made in this browser, and the file's name. */
export interface LocalMedia {
  url: string;
  name: string;
}

/**
 * `media` carries the workbench's playback options: autoplay, muted, loop, and preload.
 * `local` swaps the demo for a file the visitor opened. It is played by the plain HTML5 `Video` component (a blob address
 * is not a Mux or HLS source), it never gets the demo's poster or tracks, it opens paused, and its saved position is
 * switched off (`resumeKey=""`), so neither the file nor its name is stored. The `key` gives every source a fresh player:
 * playback state, errors, menus and the selected track all start clean, and there is still only one player on the page.
 */
export function Player({
  media,
  local,
  onLocalError,
  onLocalReady,
}: {
  media?: PlaybackProps;
  local?: LocalMedia | null;
  /** Called when the browser fails to load or play the opened file, and when it has loaded its metadata. */
  onLocalError?: () => void;
  onLocalReady?: () => void;
}) {
  if (local) {
    return (
      <VideoPlayer key={local.url} title={local.name}>
        <VideoSkin resumeKey="">
          <Video src={local.url} playsInline preload="metadata" onError={onLocalError} onLoadedMetadata={onLocalReady} />
        </VideoSkin>
      </VideoPlayer>
    );
  }
  return (
    <VideoPlayer key="demo" title={TITLE} poster={POSTER}>
      <VideoSkin>
        <Video {...media} src={SRC} playsInline crossOrigin="">
          <track kind="chapters" label="English" srcLang="en" src={CHAPTERS} default />
          <track kind="subtitles" label="English" srcLang="en" src={CAPTIONS} />
          <track kind="metadata" label="thumbnails" src={THUMBNAILS} default />
        </Video>
      </VideoSkin>
    </VideoPlayer>
  );
}
