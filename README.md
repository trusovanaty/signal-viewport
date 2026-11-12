# Signal Viewport

A video skin for [Video.js v10](https://videojs.org) (React). It is made for independent video: short films, motion work, visual experiments.

The idea: **the picture stays separate, and time control stays open and precise.** The controls never sit on top of the film. A black strip above the picture carries the title, the current chapter and the state. A solid red panel below it carries everything else: a square Play button, a ruler that is also the seek bar, time, volume, settings and fullscreen. Type is Onest (text) and IBM Plex Mono (time and ruler).

Made for the Video.js Skins Design Challenge. It is not an official Video.js product.

## Run it

```sh
npm install
npm run dev
```

- Showcase page (the entry): `http://localhost:5173/` (`?lang=uk` for Ukrainian). One real player, then real frames and a recorded clip of this same build.
- Workbench: `http://localhost:5173/workbench.html`. The Video.js sandbox shell for trying the skin at any width, ratio, language and direction. The settings live in the URL, for example `/workbench.html?width=384&ratio=9:16&dir=rtl&locale=uk`.
- Preview only: `http://localhost:5173/preview.html#width=384&ratio=9:16` (the page the workbench frames).

The port is Vite's default and may differ; the terminal prints the real address. Other scripts: `npm run build` (output in `dist/`, relative URLs, works at a domain root or in a subfolder), `npm run preview`, `npm run typecheck`.

## What the skin does

- Title strip with the video title, the chapter and a short state word (Ready, Playing, Paused, Buffering, Ended, Error). An error is marked by an icon as well as the word.
- Poster with a Start button, then Replay at the end.
- Click the elapsed time to open "Go to time": type `m:ss` or `h:mm:ss`, Enter to jump, Escape to close. It uses the player's own seek, keeps play or pause, and explains a time outside the video.
- Ruler as the time slider: ticks and labels sized to the width, frame previews on hover and drag when the source has a storyboard, chapters from a WebVTT chapters track.
- Settings menu with Speed, Quality, Captions and Chapters. A section appears only when the source and the browser really offer it. Picture-in-Picture appears only where it is supported.
- Saved per viewer (localStorage, guarded): speed, mute and caption language, and the position of each video. A short "Resumed" note is shown after a saved position is restored. "Start over" and "Reset saved settings" are in the menu.
- Error dialog with a friendly message, a labeled technical detail, and one manual "Try again".
- Keyboard: Space/K play, M mute, arrows or J/L seek, Up/Down volume, 0-9 jump, `<` `>` speed, C captions, I picture-in-picture, F fullscreen. Visible focus everywhere. A live region announces state changes.
- Two languages for the skin's own strings: English and Ukrainian (the rest comes from Video.js's translations).
- Narrow players get their own composition: the panel becomes two rows, the settings button loses its value, the menu opens as a sheet inside the player.
- Reduced motion and forced-colors styles are included.

## Use it in a project

The skin is the code in `src/`, started from `src/video/skin.tsx`. Copy `src/` into a React project that uses Video.js v10 (`@videojs/react` 10.3.0) and keep the `@/` alias to it (see `tsconfig.json` and `vite.config.ts`; Tailwind v4 is used through `@tailwindcss/vite`). Then:

```tsx
import '@/skin.css';
import { MuxVideo } from '@videojs/react/media/mux-video';
import { VideoPlayer } from '@videojs/react/video';
import { VideoSkin } from '@/video/skin';

export function Film() {
  return (
    <VideoPlayer title="Your film" poster="/poster.webp">
      <VideoSkin resumeKey="your-film">
        <MuxVideo
          src="https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8"
          playsInline
          crossOrigin=""
        >
          <track
            kind="chapters"
            label="English"
            srcLang="en"
            src="/chapters.vtt"
            default
          />
        </MuxVideo>
      </VideoSkin>
    </VideoPlayer>
  );
}
```

Replace the placeholders. This example type-checks against the project; it was not run with a real stream of its own.

**`resumeKey`.** The saved position is stored per video under the key you give. Without `resumeKey` the video's resolved title is used, and without either nothing is saved. Give every video a stable, unique key. A saved position is ignored when the loaded video's duration no longer matches the saved one, and positions near the end or inside the first seconds are not kept.

The media shown in this repository is configured in `apps/preview/src/frame/player.tsx`: the stream, the poster, the title, and `MATERIAL` (author, a short note, and whether it is demo footage). The showcase prints only what is filled in there.

## Where things live

- `src/`: the skin. `src/video/` is the component and its parts, `src/styles/` the styles (`signal.css` is the design), `src/fonts/` the local font files and their licenses.
- `apps/preview/`: the showcase (`index.html`, `src/demo/`), the workbench (`workbench.html`, `src/shell/`), the preview frame (`preview.html`, `src/frame/`), and `public/` (chapters track, showcase images and clip, font licenses).
- `design/spec.md`: the design decisions and the checks that were run.
- `skin.json`: what the skin was created from; it records the Video.js version.
- `vercel.json`, `netlify.toml`, `npm run deploy`: how the showcase and workbench build and deploy on a static host. Nothing is deployed by default.

## Checked and not checked

Checked (automated, Chrome on Windows): window widths 320, 375, 768 and 1440 px without horizontal scroll or overlapping controls; keyboard operation and visible focus; the menu on emulated touch; the error, loading, ended and restored states; English and Ukrainian; `npm run typecheck` and `npm run build`.

Checked on a generated 36-minute local file: the ruler, jumps to 30:00 and other times, errors, keyboard and mobile widths.

Not checked: Safari, Firefox, a real phone, a screen reader, a real reduced-motion setting, real browser zoom at 200% (a 720 px window was used as a narrow-layout check instead), right-to-left layout, interface languages other than English and Ukrainian, and a long (hours) real video. Passing an automated check is not a claim of full accessibility.

## Licenses

- Skin code: Apache License 2.0, Copyright 2026 Trusova Natalia. See [`LICENSE`](./LICENSE).
- Fonts are not under the code license. Onest (Copyright 2021 The Onest Project Authors) and IBM Plex Mono (Copyright 2017 IBM Corp.) are under the SIL Open Font License 1.1; the texts are in `src/fonts/` and `apps/preview/public/font-licenses/`.
- Video.js and the other dependencies keep their own licenses.
- Demo footage: an AI-generated fashion film made for this page with Kling 2.6 Pro through Flora (`apps/preview/public/media/scarlet-walk.mp4`), with chapters, captions and a ruler storyboard written for it. Check the generator's terms before reusing it; it is shown only to demonstrate the skin. Replace it with your own video.
- Showcase images and the clip are captures of this skin playing that demo footage.
