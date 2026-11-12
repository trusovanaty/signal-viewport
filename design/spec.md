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

## Showcase page (entry `index.html`; local dev: `/`, `?lang=uk` for Ukrainian; the workbench is `workbench.html`, the frame it uses `preview.html`)

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

### Final check round (routes, example, Ukrainian copy, README)

- Routes: the showcase is now `apps/preview/index.html` (the entry), the workbench moved to `workbench.html`; `vite.config.ts` inputs are `showcase`, `workbench`, `preview`. The showcase's "Open workbench" link points at `./workbench.html`. The workbench still frames `preview.html` and renders the skin. Missing favicon links on the workbench and preview pages were added (they caused a 404 in the console).
- The integration example is a complete file (imports, `resumeKey`, placeholders) that type-checks against the project; it is titled "Minimal example" and the text says what to copy and replace. It was not run against a stream of its own.
- Ukrainian copy was reread against the English: calques removed ("Призначено жити поза цією сторінкою", "Дотикове меню", "Нічим не закрите" kept as a natural phrase), plain terms for the timeline trio, and "Не є офіційним продуктом Video.js".
- README rewritten for this project (idea, run, showcase and workbench, features, use and `resumeKey`, layout, checked and not checked, licenses).
- Checks (Chrome on Windows): all six gallery images and `timeline.mp4` load; the recording plays from its own button (the main player stays idle); links return 200 or point at the public repository; no console errors on the showcase at 320, 375, 768 and 1440; the workbench and the preview page load the skin.

## Go to time (precise jump on a long video)

- The elapsed time in the panel is a button ("Go to time"). Pressing it (mouse, touch, Enter or Space) lays a small field over the readout; the separator and total are hidden, not removed, so the row and the panel never change size (checked at 320, 375 and 1440 px).
- Formats: `m:ss` (minutes may be any number, so 90:00 works) and `h:mm:ss` (minutes and seconds up to 59). Enter jumps with the player's own `seek` action, so play or pause stays as it was; Escape or a click elsewhere closes it, and Escape returns focus to the button. Not in the formats: "Use m:ss or h:mm:ss". Past the end: "Past the end. Max 36:00". The message is a plate on the picture's lower edge with `role="alert"` and `aria-describedby` on the field. After a jump a polite live region says "Went to 30:00". English and Ukrainian strings.
- Typing never reaches the hotkeys (Video.js ignores editable targets): m, f, k, space and digits typed in the field changed nothing. The jump is an ordinary seek, so the saved position follows (jump to 30:00, play, pause, reload: "Resumed 30:01").
- Limitation: in fullscreen the browser itself consumes Escape to leave fullscreen (the field closes on a second press). Not tested in a real fullscreen session.

### Long source test (local only)

A real 36:00 MP4 was generated with ffmpeg (test pattern with a running counter, silent tone, 22 MB, keyframe every 5 s) and played from a local-only page (`apps/preview/long-test.html`, file in `apps/preview/_local/`, both git-ignored and not part of the build). The duration is the file's own (2160 s), nothing is overridden. Results (Chrome, Windows): the ruler labels are 0:00, 10:00, 20:00, 30:00; a click on the ruler at 30:00 lands on 29:46 (pixel precision); Go to time 30:00 lands on 30:00 exactly; 12:34 while playing stays playing; 0:35:59 gives 35:59; 36:00 and 0:00 work; 1:05:30, abc and 75:99 show errors and do not move the video. Keyboard: Tab reaches the button in five stops from the page start, Enter opens, Enter jumps, Escape closes. Mobile 375 and 320: field and message inside the player, no horizontal scroll. Not tested: Safari, Firefox, a real phone, a screen reader, a real hours-long stream.

## Demo footage swapped to the fashion film

- The showcase player now plays `apps/preview/public/media/scarlet-walk.mp4`, an AI-generated 10-second fashion film (Kling 2.6 Pro through Flora: two 5-second clips, the second started from the last frame of the first, joined by a straight cut). A plain MP4 through the `Video` component; no Mux. Title "Scarlet Walk", labeled "Demo footage"; the author line stays empty. Credits tell readers to check the generator's terms before reusing it.
- Tracks written for it: chapters (Approach, Silhouette), English captions (three short lines of original text), and a ruler storyboard (a 10-frame sprite sheet `thumbs.jpg` with `thumbs.vtt`), so previews, chapters and captions all work. Quality is absent (a single MP4), as the skin intends.
- All showcase frames and the recorded clip were captured again from this video. The Restored frame is taken on a 36-minute copy (the film looped, `apps/preview/_local/long-scarlet.mp4`, git-ignored), because saved positions apply only to videos longer than 15 seconds; the page says so. The Loading and Error frames come from stalling and blocking the MP4.
- Checks again (Chrome, Windows): widths 320, 375, 768, 1440 without horizontal scroll or console errors, all images and the clip load, all six gallery toggles load their images, the recording plays from its button while the main player stays idle, the workbench and preview page load the skin.

## Visual edit of the showcase (local: http://localhost:5199/ , `?lang=uk`)

Three scales instead of one: the wide player (up to 1120 px inside a 1184 px column with 32 px gutters, 16 px on phones), large interface fragments (sharp 2x crops), and compact text columns (about 34 em). Text never spans the player's width. White page, black type, one full-width black band; red stays the colour of the player panel.

- **Hero.** Mono top row (SIGNAL VIEWPORT, VIDEO.JS V10 SKIN) and an EN | UK switch (plain links to `?lang=en` and `?lang=uk`, `aria-current` on the active one). Slogan "EVERY FRAME. WITHIN REACH." / "КОЖЕН КАДР. ПІД КОНТРОЛЕМ." is sized from its own container width (`11.8cqw`, 30–104 px): 104 px at 1440, 85 px at 768, 40 px at 375, 34 px at 320 (the longest Ukrainian line is 279 px of 288). The real player starts at y = 347 in a 1440×900 window. Under it: title, "Demo footage", the AI origin, a hint, one short key line and a native `details` "Keyboard shortcuts" with the full list.
- **Layers** is a short strip: three numbered notes beside one real frame with three square markers outside the picture (hidden on phones; the numbered list stays).
- **Timeline** ("DON'T GUESS. FIND IT.") shows a sharp 2x crop of the ruler, the preview frame and the time, with enough picture above for context (1120×260 CSS px, recorded at 2240×520), plus a dedicated narrow fragment (343×300) on phones. Two recordings, silent, no autoplay, started by the button under them ("Recorded from the player."); the button drives whichever clip is visible. Read, Preview and Jump are three ruled captions, not cards.
- **Responsive** ("LESS SPACE. SAME CONTROL.") shows the two real narrow states side by side in one grid with the text: playing (343 px player in a 375 px window) and settings open (288 px player in a 320 px window). Sizes are a secondary mono caption. The text states the real arrangement: the ruler keeps its row beside Play, the time and the other buttons go to a second row.
- **States** is a full-width black band: a numbered list at the left and one large frame at the right, with the sentence under it. The selected state is a white fill; the keyboard focus is a separate 3 px outline with a 4 px offset. Crops are honest and at one scale: focus, settings and captions show the panel and the picture above it; restored, loading and error show the whole frame. Phones: a 2-column list above the frame (numbers hidden under 480 px so Ukrainian labels fit).
- **Use** is white again: "YOUR FILM. YOUR VIEWPORT.", two links (View source, Open workbench), and two `details` blocks, "Integration example" (the checked example in a keyboard-focusable block with its own scroll, max 420 px) and "Testing & limitations" (Checked, Known limitations). The footer carries credits, the AI origin of the film, "a demonstration, not a client project", and the licenses.
- Copy lives in `apps/preview/src/demo/copy.ts` (EN and UK); styles in `demo.css` (first screen) and `showcase.css`. No new dependency, no change to the player.

**Checks (Chrome on Windows, headless; viewport = window width, player width measured):**

| Window | Player | h1 | Horizontal scroll | Console errors |
| --- | --- | --- | --- | --- |
| 320 | 288 | 34 px | none (EN, UK) | none |
| 375 | 343 | 40.5 px | none | none |
| 720 (narrow-layout check, not a browser zoom) | 677 | 80 px | none | none |
| 768 | 722 | 85 px | none | none |
| 1440 | 1120 | 104 px | none | none |

Also: the gallery works by keyboard (Tab, Space), selected and focus look different, every state image loads; the recording starts and stops and the main player stays idle; on 375 only the narrow clip plays; both `details` open from the keyboard, the code block is focusable and scrolls; all links point at real targets; typecheck and build pass. A 720 px window was used as a check of the narrow layout; it is not the browser's own 200% zoom, which has not been tested. Not tested: Safari, Firefox, a real phone, a screen reader, a real reduced-motion setting, real browser zoom at 200%. The reference sites (awwwards pages) were not opened; the composition follows the brief's description, not an examination of those sites.

## Hero fit (v12)

- Desktop (900 px and wider): the slogan (60 px) and the lead share a row; spacing is tight. The page measures where the player starts (`--demo-above`, set from the hero's height) and CSS limits the stage width to `(100dvh − above − 28px − 128px) × 16/9`, never below 640 px and never above the column. The 128 px is the title strip plus the control panel, so the whole player is inside the window with a 28 px reserve. The picture keeps 16:9 (measured 1.778), the panel is still 88 px, nothing is scaled, cropped or hidden, and no `overflow: hidden` is used.
- Measured (Chrome): 1440×900 → player 990 px, bottom at 872; 1440×800 → 812 px, bottom 772; 1280×720 → 670 px, bottom 692; 1024×768 → 756 px; 900×700 → 640 px (the minimum). A shorter window than the minimum allows scrolls normally. Phones and narrow windows are unchanged (375 px: 343 px player, panel 150 px). No horizontal scroll at 320, 375, 768, 900, 1024, 1280, 1440; no console errors.
- State pictures are now tight real crops captured at 2x: Focus (the left half of the panel with the black frame on the pin), Settings (the menu and the right half of the panel), Restored (the right half of the title strip showing "Resumed 19:40"), Error (the dialog with black around it); Captions and Loading keep the whole frame. The Focus note was corrected: on the ruler focus is a heavy black frame around the pin; buttons get the double ring.
- Layers: "Playback controls stay below the picture." (UK: "Керування відтворенням лишається під зображенням."). Responsive: the mobile text is one sentence; the sentence about the settings sheet shows from 720 px up.

## Polish of v12 (v13)

- **One hero block.** Header (labels and EN | UK), slogan, lead, player and the captions under it share one width (`.demo-hero`). The width is limited by the window's height as before, so the language switch, the lead, the player and the caption block end at the same right edge (checked: 1156 px at 1440×900, 999 px at 1440×800, EN and UK). The rest of the page keeps the wider column. The slogan lines never wrap and the slogan size also follows the window's height (`min(11.8cqw, 60px, 6.5dvh)`), which removed a feedback loop where a wrapped Ukrainian slogan made the header taller and the player narrower (a 640 px player at 800 px high in UK). Results: 1440×900 → player 996 px, panel bottom 872; 1440×800 → 839 px, bottom 772; the same in EN and UK. The picture stays 16:9, the panel stays 88 px, nothing is scaled, cropped or hidden.
- **One short hint.** "Play. Scrub. Find your moment." plus the "Keyboard shortcuts" details (keyboard accessible). The always-visible key line is gone on every size.
- **Layers.** Number in its own narrow column; the name on one line, the note on the next: Title (Name, chapter and playback status.), Picture (The film, with playback controls below it.), Controls (One dedicated surface for playback.). Ukrainian equivalents added.
- **Timeline notes.** Compact rows: "01 Read — See your position.", "02 Preview — Check the frame.", "03 Jump — Choose a chapter."; on phones one row each (number and name together, the note beside), three columns on wider screens.
- **Responsive.** Text: "The ruler keeps its space. The other controls move to a second row." Captions: "Two rows. One clear timeline." and "Settings stay inside the player."; window and player widths stay as a secondary mono line.
- **Gallery.** The Focus crop is unchanged. Focus note: "A clear focus marker on the ruler. A contrasting ring on buttons." The line "Player captures shown in English." (UK: "Кадри плеєра показано англійською.") appears once under the gallery instead of in every state. The real focus style of the player was not changed.
- **Footer.** Three small groups (Design & code: Natalia Trusova · Apache 2.0; Typography: Onest + IBM Plex Mono · OFL; Demo film: Scarlet Walk · AI-generated with Kling 2.6 Pro via Flora), a details block "Demo footage & rights" (the film's terms of reuse depend on the generator's terms and are not confirmed here; a demonstration, not a client project; Video.js under its own license), the license links, and one quiet contest line.
- **Checks** (Chrome on Windows): 320, 375, 720 (a narrow-layout check, not browser zoom), 768 and 1440 px, EN and UK, no horizontal scroll and no console errors; the gallery, both details blocks and the footer details work by keyboard; the recording starts and stops; the player's own functions were not touched; typecheck and build pass. Not tested: Safari, Firefox, a real phone, a screen reader, a real reduced-motion setting.
