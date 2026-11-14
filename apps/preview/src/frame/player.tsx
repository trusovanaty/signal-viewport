import { useLocale } from '@videojs/react/i18n';
import { useState } from 'react';
import { MuxVideo } from '@videojs/react/media/mux-video';
import { Video, VideoPlayer } from '@videojs/react/video';

import { VideoSkin } from '@/video/skin';

import type { PlaybackProps } from '../shell/params';

// What the preview plays. Change these to try the skin with your own media. The demo streams from Mux (adaptive HLS, up
// to 1080p, with a Quality menu); if Mux cannot be reached it falls back to the same film as a plain MP4 served from
// `apps/preview/public/media`.
const MUX_SRC = 'https://stream.mux.com/jtoph8ex1ztaAdw02OjWM7tpf8Veqtx38dcp6sJ02nhzo.m3u8';
const SRC = './media/freefall-bloom.mp4';
const POSTER = './media/poster.webp';
/** Shown in the skin's title strip. Replace with your own video's title. */
export const TITLE = 'Freefall Bloom';
/**
 * What the demo page prints under the player. `author` and `about` stay null until the real film is known: the page
 * shows only what is filled in here, so nothing is invented. Replace SRC, POSTER and TITLE above together with this.
 */
export const MATERIAL: { author: string | null; about: string | null; isDemo: boolean } = {
  author: null,
  about: 'AI-generated film and music, by the author.',
  isDemo: true,
};
/** Tracks served from `apps/preview/public/media`: chapters, captions, and a ruler preview storyboard (a sprite sheet). */
const THUMBNAILS = './media/thumbs.vtt';
const NO_FALLBACK = new URLSearchParams(location.search).has('nofallback');

/** The demo's chapters and captions in the player's language (English, or Ukrainian when the page is). */
function useDemoTracks() {
  const uk = useLocale().startsWith('uk');
  const lang = uk ? 'uk' : 'en';
  const label = uk ? 'Українська' : 'English';
  const suffix = uk ? '.uk' : '';
  return (
    <>
      <track kind="chapters" label={label} srcLang={lang} src={`./media/chapters${suffix}.vtt`} default />
      <track kind="subtitles" label={label} srcLang={lang} src={`./media/captions${suffix}.vtt`} />
      <track kind="metadata" label="thumbnails" src={THUMBNAILS} default />
    </>
  );
}

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
        <VideoSkin resumeKey="" themeSwitch>
          <Video src={local.url} playsInline preload="metadata" onError={onLocalError} onLoadedMetadata={onLocalReady} />
        </VideoSkin>
      </VideoPlayer>
    );
  }
  return <DemoPlayer media={media} />;
}

/** The demo film: Mux first, the bundled MP4 if the stream fails to load (once; the player restarts clean on the file). */
function DemoPlayer({ media }: { media?: PlaybackProps }) {
  const [fallback, setFallbackState] = useState(false);
  // `?nofallback` keeps the Mux failure on screen (to look at, or to capture, the error state).
  const setFallback = (value: boolean) => (NO_FALLBACK ? undefined : setFallbackState(value));
  const tracks = useDemoTracks();
  return (
    <VideoPlayer key={fallback ? 'demo-file' : 'demo-mux'} title={TITLE} poster={POSTER}>
      <VideoSkin themeSwitch>
        {fallback ? (
          <Video {...media} src={SRC} playsInline crossOrigin="">
            {tracks}
          </Video>
        ) : (
          <MuxVideo {...media} src={MUX_SRC} playsInline crossOrigin="" onError={() => setFallback(true)}>
            {tracks}
          </MuxVideo>
        )}
      </VideoSkin>
    </VideoPlayer>
  );
}

/**
 * The same film in a frame of another shape (the ratio comes from `--preview-player-ratio` on a parent, and the picture
 * fills the frame, cropped, via `--media-object-fit`). No saved position: it is only a demonstration of the frame, and
 * several of them can stand on one page. It has the same menu as the main player (speed, quality, captions, chapters,
 * colour): the same Mux stream (metadata only until played), with the bundled MP4 as the fallback.
 */
export function FormatPlayer() {
  const [fallback, setFallback] = useState(false);
  const tracks = useDemoTracks();
  return (
    <VideoPlayer key={fallback ? 'format-file' : 'format-mux'} title={TITLE} poster={POSTER}>
      <VideoSkin resumeKey="" themeSwitch>
        {fallback ? (
          <Video src={SRC} playsInline preload="metadata" crossOrigin="">
            {tracks}
          </Video>
        ) : (
          <MuxVideo src={MUX_SRC} playsInline preload="metadata" crossOrigin="" onError={() => setFallback(true)}>
            {tracks}
          </MuxVideo>
        )}
      </VideoSkin>
    </VideoPlayer>
  );
}
