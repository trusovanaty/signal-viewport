# Signal Viewport — design spec

Source: user reference image (cinematic viewing instrument), used as direction, not pixel spec.

## Concept
A quiet rectangular video viewport with a solid signal-red transport panel directly below it. Flat, sharp, graphic. The video is never covered by controls.

## Layout
- Viewport: video, no radius, no overlay controls, no shadow.
- Panel (always visible, never auto-hides): solid red, 12px padding.
- Wide (container >= 560px), one row: `[Play 48] [Time ruler, flex] [elapsed / total] [Mute + volume slider] [Fullscreen 48]`.
- Narrow (< 560px), two rows: row 1 `[Play] [Ruler]`; row 2 `[elapsed / total] ... [Mute] [Fullscreen]`. Volume slider hidden on narrow (mute stays; touch devices use hardware volume). DOM order = reading order = focus order.

## Tokens
- `--signal-red: #E52600` (black 4.61:1, white 4.56:1 on it; both pass AA for small text)
- `--signal-ink: #000000`
- `--signal-paper: #FFFFFF`
- Radius 0 everywhere. No shadows, no blur.
- Type: system sans (Arial/Helvetica stack), bold, tabular numerals. Time readout 16px bold; ruler labels 12px.

## Controls
- Play/pause: 48x48 black square, white icon. Restart icon when ended.
- Time ruler = the seek slider (`TimeSlider`). Evenly spaced ticks: minor (short) and major (long) every nice-number step chosen from duration (<= ~8 majors), sparse labels on majors. Black ticks; the played part is drawn in white (same ticks clipped to the fill). Baseline rail black with white fill. Playhead: white 3px vertical line with a 24px-wide hit area.
- Pointer time chip (black, white text) replaces the labels row while hovering/dragging.
- Mute: transparent square, black icon; hover/focus inverts to black/white.
- Volume: inline horizontal slider (not hover-only popover), black rail, white fill, white bar thumb.
- Fullscreen: same style as mute.
- Buffering spinner centered on viewport; error dialog (Video.js) kept and restyled flat; hotkeys, gestures, status announcer kept.

## Focus
Double ring: 3px white outline + 2px ink gap ring (box-shadow). Playhead focus: 3px ink outline.

## Motion
Only color swaps (<= 100ms via `--media-duration-fast`), collapses under `prefers-reduced-motion`.

## Out of scope (not requested)
Settings menu, captions toggle, PiP, cast, AirPlay, skip buttons, chapters, thumbnails.

## v1 player shell (added)
- **Title strip** (black, 40px) above the viewport: title left; current chapter (if the source has chapters) and a status word (`Ready / Playing / Paused / Buffering / Ended / Error`) right. Narrow players drop the chapter first, then the status; the title is only truncated. Hidden in short landscape fullscreen.
- **Start / Replay**: 96px black square over the poster before the first play, and over the last frame after the end. Hidden while playing or paused mid-way.
- **Settings menu**: trigger shows the settings icon and the current speed (`1×`); accessible name `Playback settings, speed 1×`. Sections Speed / Quality / Captions appear only when available (quality needs more than one rendition, captions need tracks). Quality shows the chosen mode (`Auto`) and, separately, `Now playing 720p`. With one section its options are listed directly; with several, each is a submenu that replaces the parent view.
- **PiP**: shown only where the browser offers it; hidden on narrow players.
- **Panel**: play | timeline | time | cluster (volume, settings, PiP, fullscreen). Volume slider appears from a 840px container; PiP from 560px.
- **Narrow menu**: a full-width sheet sitting on top of the panel, capped to the height of the picture area; long lists scroll.
- **Focus**: the player container itself takes the first Tab stop (it scopes the hotkeys) and shows a ring.
- Not in v1: preview thumbnails, chapter list, preference persistence (stage 2); resume position (stage 3).

## Stage 2 (added)
- **Preview frame** above the ruler under the pointer (storyboard track, 160px wide, 128px on narrow players), clamped to the ruler and the player; appears only while pointing or dragging and is absent when the source has no storyboard. The black time chip stays on the ruler.
- **Chapters** section in the settings menu when the source has a chapter track: start time, frame (if storyboard), title; the current chapter is marked and choosing one seeks to it.
- **Saved preferences** (one JSON entry `signal-viewport:prefs`, format version 1): speed, mute and caption language. Restored once media is attached (speed after metadata, captions when the track list has unique ids and metadata has loaded); only non-default values are stored; a saved language the source lacks is kept until the user changes captions; unreadable, unknown-version or blocked storage is ignored. Menu row **Reset saved settings** appears only while something is saved and restores defaults. Volume level and the quality choice are not saved.

## Stage 3 (added)
- **Resume position, per video.** One storage entry `signal-viewport:resume` (format version 1) holds a map keyed by the video id: the `resumeKey` prop of the skin, else the resolved title (a streamed source's URL is a `blob:` address, so it cannot identify a video). Without an id nothing is saved.
- Saved on pause, every 5 s while playing, and when the tab is hidden or closed. Not saved before the first 5 s or inside the last 10 s; reaching the end forgets the entry, so a replay starts at 0.
- Restored once, as soon as the duration is known, only if playback has not started. The video stays paused (no autoplay) at the saved position. An entry whose saved duration differs from the loaded one by more than 2 s is ignored and removed.
- Menu row **Start over** appears only while this video has a saved position: it jumps to 0 and forgets the position.
- At most 30 videos are kept (oldest dropped); unreadable, unknown-version or blocked storage is ignored.

## Typography (added)
- **Onest** (weights 500 / 600; latin, latin-ext, cyrillic, cyrillic-ext) for the video title (600), menus and their rows (500; selected row and Back 600), dialogs and captions (500).
- **IBM Plex Mono** (400 / 500, all used at 500) for the elapsed time (22px) and total (14px), ruler labels and pointer chip, status, chapter, speed, menu values, chapter times, notes, and the demo page's caption lines.
- Local `woff2` files in `src/fonts/`, loaded through `src/styles/fonts.css` with `font-display: swap`; only real weights, `font-synthesis: none`. Licenses (SIL OFL 1.1) are kept apart from the code license in `src/fonts/`.
- Both Plex files cover Cyrillic, so Ukrainian and Russian text is set in Plex too (checked with І Ї Є Ґ ґ ʼ and « » — №). The system sans-serif is only a safety net for other scripts.
- **Ruler labels** are chosen from the ruler's real width and the label width (`4:00` vs `1:30:00`) so they never touch or leave the ruler; checked for 111 s, 9 min, 25 min, 1:05:30, 2 h and 3.5 h at six widths.
- **Narrow players** (< 560 px): the settings button is the icon alone (the speed stays in its accessible name and in the menu), so the time never moves when the speed changes. Below 340 px the time shrinks to 20 / 13 px and the side padding to 12 px. A very long time (`1:05:30 / 2:00:00`) wraps the buttons to their own line instead of overflowing.

## Error: next step (added)
- The error dialog offers **Try again** (primary, white) and **OK**. Try again clears the error, asks the media to load its source again and plays; it is one retry per click. There is no automatic retry: the streaming engine already retries brief failures, and a loop on a dead URL is not a recovery. OK only closes the message; the transport stays usable (fullscreen exit included).
- Checked: with the stream blocked then restored, Try again recovers (status Playing, media ready); with the stream still blocked, 0 requests in 10 s of idle and exactly 1 per click.
- **PiP** is verified in Chrome: the window opens and closes, the button's name changes (Enter / Exit picture-in-picture), and the panel keeps controlling playback. It stays hidden where the browser offers no PiP and on narrow players.

## Language (added)
- **One language at a time, everywhere.** Everything the skin shows follows the player's locale (the `I18nProvider` locale, else the page `lang`): visible text and accessible names alike.
- **Two sources, one hook** (`src/video/i18n.ts`, `useCopy()`): words Video.js already translates (Speed, Quality, Captions, Volume, Paused, Playing, the error texts by code) come from its own locale packs, so they follow 50+ languages; the skin's own words (status Ready / Buffering / Ended / Error, Chapters, Start over, Reset saved settings, Try again, Now playing, Details, the settings button's name) live in a small table with **English and Ukrainian**. An unlisted language uses the exact locale, then its language, then English. Adding a language is one object in `i18n.ts`.
- **Error dialog:** the sentence is Video.js's translated text for the error code; the engine's own message (English, technical) is kept apart under a small "Details" label.
- Content that belongs to the video (title, chapter names, caption track names) is shown as the source provides it.
- The demo page takes the language from the address: `demo.html?lang=uk` (default English).
- Not covered: right-to-left layout, and languages other than English and Ukrainian for the skin's own words (they fall back to English).

## Resumed notice and error symbol

- After a saved position is restored, the title strip's status word is replaced for 4 seconds by "Resumed 0:47" (uk: "Продовжено з 0:47"). It disappears at once on Play, and the same sentence goes to screen readers through a separate polite live region. A fresh visit shows no notice.
- An error is never color-only: an alert icon sits before the status word in the strip and before the title in the error dialog.
- Small players (container under 560 px, about 180 px tall picture): the error dialog is compacted (smaller paddings and text, 40 px buttons) so title, text and both buttons stay inside the picture. The technical detail line is hidden there. Checked at 320 and 375 px, en and uk.


## Main typeface: Onest (replaces IBM Plex Sans)

Three candidates with verified OFL licenses and full Latin and Cyrillic were set on the same composition (title strip, menu rows, error text) at the same sizes: **Onest**, **Geologica**, **Inter Tight** (`design/screenshots/fonts-compare.png`; IBM Plex Mono unchanged for the ruler and technical data).

- Geologica: expressive, but wide; long titles hit the ellipsis earliest on a 320 px player.
- Inter Tight: very readable and compact, but neutral; it gives the strip no character.
- **Onest (chosen):** geometric grotesque with real Ukrainian forms (ґ, є, ї, і), clear numerals and a confident 600 weight, narrow enough for mobile. Weights 500 and 600, four subsets (latin, latin-ext, cyrillic, cyrillic-ext), local woff2 in `src/fonts/`, license `OFL-Onest.txt`.
- Rendered Fonts (Chrome DevTools, `CSS.getPlatformFontsForNode`): title Onest SemiBold, menu rows Onest Medium, demo text Onest, time and ruler labels IBM Plex Mono Medium. No system fallback was rendered for the tested strings, including the Ukrainian title.

## Demo page

One page (`demo.html`), no parallel site: small SIGNAL VIEWPORT label, the line "A clear view. A precise timeline.", the player straight away, then the title with a "Demo footage" tag and a one-line note, then three short points and the key list. `?lang=uk` translates the page and the skin.

The material shown under the player comes from `MATERIAL` in `apps/preview/src/frame/player.tsx` (`author`, `about`, `isDemo`). `author` is null until the real film is known, and the page prints only what is filled in. The Mux sample stream stays labeled as demo footage; no Mux ID of the author's own is used.

## QA run for this round (headless Chrome, local)

Widths 320, 375, 768, 1440 (player widths 288, 343, 707, 960): no horizontal page scroll, no control overlaps, touch targets at least 48 px, ruler labels never collide, preview thumbnail and time chip stay inside the player at both ends of the ruler, mobile sheet stays inside the player and scrolls, a long and a Ukrainian title end with an ellipsis, the status and chapter hide first, hours time wraps to its own line on narrow players. Error dialog, ended state, resume notice, Start over and the visible keyboard focus were exercised. Not verified: Safari, Firefox, a real phone, a screen reader, real reduced-motion setting.

## Showcase page (demo.html, local: http://localhost:5199/demo.html, `?lang=uk` for Ukrainian)

Sections: compact hero and the one real player; "The picture stays clear" (real frame, three labels in a rail beside it, a numbered list under it on narrow screens); "Find the moment" (a recorded clip, silent, no autoplay, started by a button below it, labeled "Recorded from the player"); "Rearranged. Not squeezed." (wide and narrow real frames, no phone body, each labeled with the measured window and player width); "Every state has a place" (one large frame, six plain toggle buttons with aria-pressed, no tabs semantics, no carousel; Checked and Known limitations lists); "Built on Video.js v10" (the setup from `frame/player.tsx`, link to the workbench, credits and font licenses).

- Frames are captured from this build by driving the real player (focus by Tab, settings menu, captions on, restored position, stalled segments for loading, blocked playlist for error). Nothing is static HTML pretending to be a state. An hours-time frame was dropped because it could only be made by editing the text in the page.
- Styles: `showcase.css`, every selector starts with `.sc-`; `demo.css` holds the first screen. The skin's CSS is untouched by the page.
- Images have width and height and load lazily; the clip uses `preload="none"`. One skin and one clip video exist on the page; nothing plays on load.
- Material line comes from `MATERIAL` (author empty, so no author line is shown). Links point only to real targets: `index.html` (workbench), the two OFL texts, the public repository https://github.com/trusovanaty/signal-viewport (View source) and its Apache 2.0 LICENSE (© 2026 Trusova Natalia).

### Menu: focus is not selected

The white row was the hover/focus fill (library `data-highlighted`). Now: hover (real pointers only) inverts the row; keyboard focus (`:focus-visible`) inverts it and adds an inner ink frame; selected is bold text and a square mark; disabled is dimmed. The row focused automatically when a menu opens by touch or mouse is not `:focus-visible`, so it no longer looks selected. Checked: touch (emulated) open, keyboard open, submenu, Back, Escape, focus returning to the settings button.

### QA, showcase round (headless Chrome on Windows)

| Window | Player width | Horizontal scroll | Console errors |
| --- | --- | --- | --- |
| 320 | 288 | none | none |
| 375 | 343 | none | none |
| 768 | 707 | none | none |
| 1440 | 960 | none | none |

Also checked: images load, links return 200, gallery toggles work by keyboard (Tab, Space), Ukrainian page (lang uk, Onest in headings and text, IBM Plex Mono in labels), resume and Start over still work. Not checked: Safari, Firefox, a real phone, a screen reader, a real reduced-motion setting.
