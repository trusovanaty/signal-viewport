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

- The showcase player now plays `apps/preview/public/media/scarlet-walk.mp4`, an AI-generated 10-second fashion film (Kling 2.6 Pro through Flora: two 5-second clips, the second started from the last frame of the first, joined by a straight cut). A plain MP4 through the `Video` component; no Mux. Title "Scarlet Walk", labeled "Demo footage"; the author line stays empty. Credits say the film and the music are the author's own work.
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

## Open your video (local file)

- **UI.** Under the player: "Open your video" (always), "Restore demo" (only for an opened file) and the line "Opened locally. Not uploaded." (UK: «Відкрити своє відео», «Повернути демо», «Відкрито локально. Не завантажено.»). A real `<input type="file" accept="video/*">`, hidden, opened by the button; no drag-and-drop. A file that is not a video (a type that does not start with `video/`) shows "That file is not a video." and the current source stays.
- **Player.** Still one player instance. A local file is played by the plain HTML5 `Video` component with a blob address from `URL.createObjectURL(file)` (not the Mux component). It has no poster, none of the demo's chapters, captions or ruler previews, and it opens paused. The player is remounted for every source (`key`), so playback state, errors, menus and the selected track start clean. The address is revoked when another file replaces it, when the demo is restored, and when the page closes.
- **Privacy.** Nothing is uploaded and nothing about the file goes to analytics, logs or other services: the only request caused by the file is the browser's own read of the blob address. The name appears only as plain text (React escapes it) in the title strip and under the player. The saved position is switched off for local files (`resumeKey=""`), so the name is not stored; localStorage after playing a local file held only the viewer preferences.
- **Validation (final pass).** MIME type and extension are only first hints: a `video/*` type or a video extension passes; an empty or `application/octet-stream` type also passes (some real videos arrive that way); an image, text, audio or other clearly different type is refused with "That file is not a video." and the current source stays. Whatever passes goes to the player, and the browser's real result decides: if loading fails, the page says "This file could not be played in your browser. Choose another file or restore the demo." (the player's own error dialog also appears); the buttons stay, and Restore demo brings back the demo with its tracks, ruler previews and poster, and it plays. The file chooser also lists the common video extensions. No format support is promised. Nothing is analysed in memory and nothing is uploaded.
- **Ukrainian note.** «Файл відкривається лише у вашому браузері. На сервер не надсилається.» (EN: "Opened locally. Not uploaded.").
- **Focus.** Focus stays on "Open your video" after a file is chosen, after Restore demo (the Restore button disappears, so focus moves to the button that stays) and after a cancelled chooser. When a file fails to load, the player's existing error dialog takes focus (as for any player error); Open your video and Restore demo are next in the tab order.
- **Checked in the final pass (Chrome, Windows, automated; dev server and the production build through `vite preview`, same results):** a copy of the film named `.mp4`, with no extension, and `.mkv` all open and play; a text file and a PNG are refused without changing the source; random bytes named `.mp4` and `.avi` fail with the message and the dialog, another file then opens, and Restore demo returns the demo, which plays; a cancelled chooser changes nothing; the same file chosen twice gets a fresh player and a new blob address; replacing a file during playback gives one player, paused at 0:00; back on the demo it has 3 tracks, ruler previews (158 px frame from the 3200 px sprite) and a poster with the Start button; saved positions are not applied to a local file (the 36-minute file opened at 0:00 with "Ready", not "Resumed") and the existing records (`My long film.mp4`, `other-video`) were identical after playing a local file and after Restore demo; EN and UK; 1440, 375 and 320 px with no horizontal scroll; the hero is unchanged (player bottom 872 at 1440×900, 772 at 1440×800); no console errors. A truncated file whose metadata is intact (a 30 KB piece of an MP4) opens without an error, because the browser reads its header; an error would appear only when playback reaches the missing data, which was not tested. The "Failed to load resource" lines in earlier test logs came from the test fetching a revoked address on purpose.
- **Earlier pass, same feature:** the file chooser is reached by keyboard and by mouse; a copy of the demo film, a 36-minute film and a file with `&amp;` and quotes in its name open paused at 0:00 with the name shown literally; one skin and one video on the page throughout; the blob address of the previous file is released after the next file or after Restore demo; a text file is refused; a reload returns to the demo; the hero still fits in 1440×900 (panel bottom at 872); no horizontal scroll at 320 and 375; Ukrainian strings. The "Failed to load resource" lines in the test log come from the test fetching a revoked address on purpose. Not tested: Safari, Firefox, a real phone, files the browser cannot decode (the player's existing error dialog is expected), very large files.

## Stable states gallery (v17)

- **The jump, reproduced.** Before the fix the black section's stage was 555, 483, 243, 249, 423 and 555 px high at 1440 (Captions, Settings, Focus, Restored, Error, Loading), because each state used a differently cropped picture with its own aspect ratio; the longest caption also changed the height of the text below. The next section's top moved by up to 240 px at 1440 and 108 px at 375 (all four widths and both languages jumped).
- **The fix.** Six new full frames (Focus, Settings, Captions, Restored, Loading, Error) were captured in one session at one viewport and one player geometry (1120 × 758): checked pixel by pixel, the red panel starts at row 671 and ends at 757 in every one, and the title strip is identical. The close crops were removed (the ruler detail is shown in the timeline section; states are compared at one scale). All six pictures are stacked in one stage with a fixed aspect ratio (1120 / 758) and `object-fit: contain`; only one is visible at a time, so a switch loads nothing and moves nothing, and the size is reserved before any picture loads (width, height and aspect ratio). The six captions share one grid cell, so the cell is as tall as the longest caption in the current language and text size; nothing is cut and no line clamp is used; if the text grows, the cell grows. The captions are hidden from assistive technology as a block and a visually hidden live region announces the active one. No height animation.
- **Result (dev server).** Toggle row top, stage top and height, caption area, band height and the next section's top are identical for all six states at 320, 375, 768 and 1440 px in EN and UK (e.g. 1440 EN: stage 555 px, next section at 3976 for every state; 375 UK: stage 232 px, next section at 4390). A fixed-frame recording of the switching (desktop EN, mobile UK) shows the toggles, the stage and the start of the next section staying in place.
- Nothing else on the page, no fonts, colours or player functions were changed. The wider grid normalisation (shared layout tokens, three demonstration formats) was not started in this pass.

## Production check of the gallery and the local-video prompt (v18)

- **Production gallery check** (`vite preview` on port 4180, serving the fresh build: the served bundle `showcase-BOfWl0LD.js` is the one in `dist/`). Switching all six states by keyboard (Tab and Space) at 1440 EN, 375 UK and 320 EN/UK: the toggle row, the stage (555 / 232 / 195 px), the caption area (48 px at 1440, 120 px on phones) and the start of the next section stay at the same page positions in every state; all six pictures load at 1120 × 758 and their size is reserved before loading (width, height, aspect ratio 1120 / 758); exactly one picture and one caption are visible at a time; the focus ring on the state buttons is 3 px and focus stays on the buttons; no console errors.
- **What was and was not checked for assistive technology.** The hidden pictures use `visibility: hidden`, the caption stack is `aria-hidden`, and a visually hidden live region carries the active caption. In Chrome's accessibility tree only the active picture of the gallery is exposed in each state (the other five are absent), and the captions are not duplicated. This is a check of the markup and of the browser's accessibility tree; no screen reader (NVDA, JAWS, VoiceOver, TalkBack) was run, so the real spoken output is not verified.
- **Local-video prompt, under the player (no new section).** Demo mode: "Try it with your own video." / [Open your video] / "Opens locally in your browser. Nothing is uploaded." (UK: "Спробуйте зі своїм відео." / [Відкрити своє відео] / "Файл відкривається лише у вашому браузері. На сервер не надсилається."). After a file is chosen: the file's name, [Open your video], [Restore demo] and "Opened locally in your browser. Nothing is uploaded." (UK: the same UK sentence); nothing about Scarlet Walk, Demo footage or the AI origin is shown for the chosen file. The local-file tests were repeated on the production build with the same results (EN/UK, 1440, 375, 320, no console errors).

## Layers diagram, responsive pair, ruler and volume (v19–v20)

**"The picture stays clear" (layers).** A still diagram on the right: the title strip, the picture and the red panel are three real slices of one captured frame (cut at 40, 630 and 88 px of 758, so all have the same width and keep their proportions), set 18 px apart on desktop (12 px at 768, 8 px on phones). The numbers 01 / 02 / 03 and one thin guide with short connectors stand outside the layers. On the left, three short notes without row dividers (EN: Film title, chapter and playback status. / The control strip stays outside the film. / A dedicated surface for playback and navigation.; UK equivalents). Caption: "Interface anatomy. Layers separated for clarity." (UK: «Схема інтерфейсу. Шари розділено для наочності.»). On phones: heading, diagram, notes. The diagram is one `role="img"` with a description; the numbers, guide and slices are hidden from assistive technology. No animation. Measured: gaps 18/18 (1440), 12/12 (768), 8/7 (375).

**"Less space. Same control." (responsive).** Playing and Settings were recaptured in one 375 px window with one player width (343 px) and the same geometry (686 × 766 files, 343 × 383 CSS px), then shown as a pair: two equal columns, labels above (01 / PLAYBACK, 02 / SETTINGS; UK 01 / ВІДТВОРЕННЯ, 02 / НАЛАШТУВАННЯ), equal frames, captions and the technical line ("Window 375 px · player 343 px") at the same levels. Measured: both frames 343 × 383 at the same top at 1440 and 768, and the same width stacked on phones; no stretching, no cropping.

**Ruler and volume, diagnosis in the live player.** Measured at 1440 on the live skin (device pixel ratios 1, 1.25, 1.5, 2), at 0, 50 and 100 %:
- Clipping: none. The ruler, its ticks, the pin, the volume rail and the volume marker have no clipping ancestor (the only non-visible overflow is none; the ruler has `container-type: inline-size`, which does not clip). The first major tick and the pin stick out 1 px / 7 px to the left of the ruler and are fully drawn; the gap between Play and the ruler is 16 px.
- Cause 1 (real bug): the volume's white fill (`.signal-rail-fill`) reads `--signal-pos`, which only the ruler defined. In the volume slider it was undefined, the fill's width computed to 0 px, and the volume level showed only as a thin 2 px marker. Fixed: the volume slider defines `--signal-pos` from `--media-slider-fill`; the white fill now grows with the level exactly like the ruler's played part (checked at 0, 50 and 100 %).
- Cause 2: the volume marker was 2 px wide and 14 px tall, against the pin's 3 px stem. It is now 3 px × 16 px (the touch target, the whole 64 × 48 slider, is unchanged).
- Cause 3 (partly): the landing's pictures were lossy WebP (quality 92), which softens thin red-on-black lines, and they are shown scaled (the gallery at 73 %, the layers diagram at 52 %). All landing frames were recaptured from the fixed player and are now lossless WebP (about 1.5 MB in total), so the capture matches the live player pixel for pixel; scaling on a small screen still makes 1 px lines thinner, which is inherent to showing a screenshot smaller than it was taken.
- Found, not fixed: at fractional display scaling (125 %, 150 %) the 2 px major ticks come out 2 or 3 device pixels wide, depending on where they fall (at 100 % and 200 % all ticks of a kind are identical). Two attempts were made (ticks as borders; ticks placed and sized in whole device pixels) and neither made the widths uniform in the test browser, so both were removed rather than shipped; the ruler's tick code is unchanged. Not verified on a real display with fractional scaling.
- Not changed: the pin, the ticks' sizes, the rail's 2 px height, the touch targets, the position-to-value mapping.

## Desktop / Mobile switch for the demo player

- **What the adaptive layout depends on.** The skin adapts to its own container, not to the window: every layout rule is a container query on `media-root` (the two-row panel and the compact settings button under 560 px, the volume slider from 840 px, the tighter spacing under 360 px and 340 px, the settings sheet inside the player). Only a few rules use viewport media queries (hover, reduced motion, forced colors, a short landscape window). So a 375 px container gets the real mobile composition, not a squeezed desktop one, and no refactor was needed.
- **The switch.** "Desktop" (current width) and "Mobile" (EN) / «Десктоп» and «Мобільний» (UK), two buttons with `aria-pressed` next to the hint under the player. Mobile sets the player's wrapper to a 375 px maximum width, centered, never wider than the space available; no phone frame, no scaling. It only changes a `data-view` attribute: the player is not remounted, so playback, position, volume and an opened local file are unchanged. Below 720 px of page width the switch is hidden and the rule is ignored (the player is already full width).
- **Checked (Chrome, Windows; dev server and the production build through `vite preview`, same results):** in the mobile container the player is 375 × 401 px with a 150 px two-row panel, 2 ruler labels and no inline volume slider, the same composition as a real 375 px window (343 × 383 px there, because of the page gutters); the settings sheet opens inside the player; switching while playing keeps the same `<video>` and skin elements (one skin, one video), playback continues (2.7 s → 3.5 s) and survives the way back; a chosen local file keeps its blob address, name, title and position through both switches; the buttons are reached by keyboard (15 tab stops from the page start) with a 3 px focus ring and work with Space; at 768 px the switch is shown and the 375 px container fits; at 375 px it is hidden; EN and UK; no horizontal scroll and no console errors. The hero fit is unchanged in Desktop mode (player 996 px wide). Not tested: Safari, Firefox, a real phone, a screen reader.

### Desktop / Mobile: further checks (production build, `vite preview`)

- **Paused:** switching to Mobile and back on a paused video keeps the same `<video>`, the same position (3.00 s) and the paused state.
- **Volume, mute, speed:** volume 0.3 unmuted at 1.5×, playing, and volume 0.7 muted at 0.75×, paused, were identical after Desktop → Mobile → Desktop; the settings button's name followed (speed 1.5×, 0.75×).
- **Settings open:** clicking the switch with the settings menu open closes the menu (an outside click, as for any outside click); the same video keeps playing; the menu opens again in Mobile and in Desktop and stays inside the player.
- **Page narrower than 720 px and back:** the chosen mode is kept. At 700 px and 600 px the switch is hidden and the player is full width (658 and 564 px); at 800 px the switch returns with the chosen mode applied (Mobile 375 px, or Desktop 752 px); back at 1440 px it is Mobile 375 px or Desktop 996 px, and `aria-pressed` matches the real width each time the switch is visible. While the switch is hidden, the stored mode is only not applied.
- Final build checks (1440 and 375 px in UK, 1440 and 320 px in EN): captions follow the source (demo: "Scarlet Walk", Demo footage and its origin; a chosen file: its name and the local-open note, nothing about the film; after Restore demo: the demo again), the gallery does not move at 320, 375, 768 and 1440 px in EN and UK, no horizontal scroll, no console errors.

## Testing & compatibility: current status (the full list behind "Testing details")

The landing shows a short block: "Testing & compatibility" (UK «Перевірка та сумісність»), one paragraph (tested in Chrome on Windows; other browsers, physical mobile devices and assistive technologies not yet tested), a line "Interface languages: English / Ukrainian." (languages are not listed as a limitation), and one closed disclosure "Testing details" (UK «Деталі перевірки») that holds the lists below. There is no accordion inside an accordion.

Checked (automated, headless Chrome on Windows):
- Window widths 320, 375, 720, 768 and 1440 px, no horizontal scroll, no overlapping controls. The 720 px window checks the narrow layout; it is not browser zoom.
- Keyboard: every control reachable, focus ring visible, menus open, go back and close with Escape; the gallery and the disclosure blocks work with Tab, Space and Enter.
- The settings menu in Chrome's touch emulation: opening it does not mark a row as selected (an emulation, not a physical device).
- Opening your own video locally (never uploaded), several files including a broken one.
- The Desktop / Mobile switch (a 375 px container of the same player): playback, position, volume, mute, speed and an opened file are kept; a layout check, not a test on a real phone.
- Chrome's accessibility tree: in the gallery only the active picture is exposed. This is a check of the browser's accessibility tree, not of a screen reader.
- Type check and production build.
- Earlier rounds, kept in their own sections above: the error, loading, ended and restored states; a generated 36-minute file; the "Go to time" field; the pointer previews and chapters; the gallery's stability; the ruler and volume in the live player.

Not tested:
- Safari and Firefox.
- A physical mobile phone (touch was only emulated).
- A real screen reader (NVDA, JAWS, VoiceOver, TalkBack).
- The reduced-motion setting on a real system.
- Browser zoom at 200%. The 720 px window and the checks at device pixel ratios 1, 1.25, 1.5 and 2 (emulated device scale factors) are not browser zoom at 200%.
- Displays with fractional scaling (125%, 150%): the ruler's major ticks can be 2 or 3 device pixels wide (found in the test browser, not fixed).
- Very large video files; video formats the browser cannot decode (the player reports an error); a real hours-long stream; right-to-left layout.

Notes: the automated runs used headless Chrome on Windows, with no manual session on a physical device. Passing an automated check does not mean the page has no accessibility problems. The demo film is AI-generated and the terms for reusing it are not confirmed.

## Landing design system

The landing page now has a written design system (type scale, line height, colour roles, 4 px spacing, measures, control heights): `design/design-system.md`, tokens in `apps/preview/src/demo/tokens.css`.

## Ruler: replay after the end snaps, everything else glides

When Play starts the video again from the ended state (mouse, Space or Enter, Desktop or Mobile), the pin, the white fill and the played ticks return to the start at once instead of sweeping back across the ruler in about 250 ms. Seeks (keys, click, drag, also right after the end) and normal playback keep the 250 ms glide as before. Implementation: `data-snap` on the ruler for 400 ms, set in `time-ruler.tsx` only when a play or a seek-by-play follows the `ended` event; a seek after the end without play does not trigger it. There is no distance threshold.

## First screen: variant C

The first screen of the landing was redone (headline "SIGNAL VIEWPORT.", a ruler with a red pointer, the player and a side panel). See `design/design-system.md`, section "First screen". The player, the skin and their behavior are unchanged; the Desktop / Mobile group, "Your video" and "Source" moved into the panel. Checked in Chrome at 1440x900 (EN, UK), 1440x800, 1280x720, 1024x768, 768, 375 and 320: no horizontal scroll, the red control panel inside the first screen, no console errors.

## Mobile view and the exact-time field on the landing

Mobile view (1200 px and wider): the 375 px player sits on a flat quiet backing (`--surface-quiet`) that keeps the desktop player size; the page measures the desktop height and holds it, so the sections below do not move on switching (checked at 1440x900, 1440x800, 1280x720, 768, and with the shortcuts open). The Timeline section now shows the exact-time field as a feature: a capture of the real control panel with the field open (`goto-wide.webp`, `goto-narrow.webp`, only the red panel, no film frame) and the caption "click the time, type m:ss, press Enter".

## Timeline recording: the pin follows the pointer

The recorded clip in the Timeline section used to move only the pointer (the hover chip and the frame preview), and the pin stayed at 0:01 until a final click. That is how a hover works in the real player, but the clip did not show the marker moving. It is re-recorded: the pointer rests on the ruler, then presses and drags along it, and the pin, the white fill and the time follow the pointer (the real drag behavior). Files: `timeline-wide.mp4`, `timeline-narrow.mp4`, `tl-wide.webp`, `tl-narrow.webp`; the wide clip is 1952x454 (the player in the new first-screen layout is 976 px wide). The previous files are kept only outside the repository.

## Keyboard and focus section

A separate section "No mouse needed." (UK «Без миші теж зручно.») sits between the dark states band and "Your film": the list of keys on the left, and on the right a short guide to keyboard focus (click the player, press Tab, a frame shows where you are; it appears for the keyboard, not the mouse) with two captures from the real player: the black frame around the ruler marker and the white ring with a black edge on a button (`focus-marker.webp`, `focus-button.webp`, only the red panel). The list of keys in the first screen panel stays. Checked at 1440 (EN, UK), 768, 375 and 320: no horizontal scroll, no console errors.

## Loading mark

The default spinner was replaced by the skin's own mark: a black 96 px plate with a piece of the ruler (seven ticks, the pin stepping along them and back, 1.4 s). Square, white on black, no rounding; with prefers-reduced-motion the pin stands still in the middle. Files: `src/video/shared/video-feedback.tsx`, `src/styles/signal.css`. The "Loading" picture of the state gallery (`g-loading.webp`) was re-captured with it (1120x758, same geometry as the other five).

## 404 page and the removed note

`apps/preview/public/404.html` (copied to `dist/404.html` by the build): a self-contained page (CSS, language switch and the skin's Onest and IBM Plex Mono embedded, no relative files, because a 404 is served at any address). A huge "404" with the red full stop, the player's ruler with the pin far past the last tick and the chip 4:04, "This moment is not on the ruler." / «Цієї миті немає на лінійці.», one button back to the player; the language follows the browser, with an EN / UK switch; `noindex`. Vercel, Netlify and Cloudflare Pages serve `404.html` from the output folder on their own; `vite preview` (and the dev server) answer unknown addresses with the landing instead, so open `/404.html` to see it. Checked at 1440x900 (EN, UK), 1440x600, 1024, 768, 375 and 320: no scroll, fonts load, no failed requests.

The note "Player captures shown in English" under the state gallery was removed (it made no sense on the English page). The pictures in the Ukrainian version stay English until the Ukrainian re-capture (see the memory note).

## Shortcuts out of the first screen

The "Keyboard shortcuts" accordion was removed from the first-screen panel (it pushed the sections below it down). The panel keeps the line "Play. Scrub. Find your moment." and a link "Keyboard shortcuts ↓" to the section "No mouse needed." (`#sc-keyboard`). The panel now has a fixed height.

## Page rhythm: the timeline goes black and second

Order of the page: first screen (white) → Timeline (black band) → Layers (white) → Responsive (white) → States (black band) → Keyboard (white) → Your film and footer (white). The Timeline section continues the first screen's ruler motif and puts the red strip on black; lines, muted text and buttons use the dark roles of the design system, the focus ring on the band is white. The two black bands are separated by two white sections.

## Slogan in the panel, keyboard section as type

The line "Play. Scrub. Find your moment." is back in the first-screen panel as a slogan: 24-30 px, 600, the skin's red, balanced lines; the link to the keyboard section is gone. The section "No mouse needed." moved up to the third place (after the black timeline band) and is set as typography: nine keys in a 3x3 hairline grid, the main key of each shortcut at up to 104 px (Space in red), the other keys in small mono, the action under it; below it the focus guide with two captures. Order: first screen, Timeline (black), Keyboard, Layers, Responsive, States (black), Your film, footer.

## Keyboard section: two sub-sections

The section "No mouse needed." has two named parts with the same large sub-heading (40-64 px, uppercase): "Shortcuts." (the nine keys as type) and "Focus." (how to see the keyboard focus, with two captures).

## Icons: one style, the ruler's vocabulary

`src/video/shared/icons.tsx` was redrawn as one family built from the ruler's parts (a 2 px track, a tick, a solid triangle pin, a square plate): 24 px grid, solid shapes only, sharp corners, no curves. Play, pause, replay (a tick and a pin: back to the start), volume (a speaker and two ticks of different height), muted (a speaker and a cross of two straight bars), settings (three tracks with a pin each), picture-in-picture, error, fullscreen enter and exit. The icon sketches in `design/icon/` (AI-generated, traced; kept as references) were the starting point; the settings icon is the user's pick. The sketch of the whole set: `design/screenshots/icon-proposal-one-style.png`. Not yet in the skin (no control uses them): captions, go to time, open file, restore demo, close. The pictures on the landing still show the previous icons and must be re-captured in one pass when the English version is final.

## Layers as type, second on the page

The section "The picture stays clear." is now second (right after the first screen) and set as typography: the standard large heading, then the three layers as big uppercase words (Title, Picture, Controls, up to 80 px) in a hairline list with their numbers and one line each, and the layers schema beside them on the same columns as the heading text. Order: first screen, Layers, Timeline (black), Keyboard, Responsive, States (black), Your film, footer.

## Air in the black bands

The black bands use the section spacing token for their top and bottom padding (`--space-section`, 48-88 px; was 36-64 / 40-72). In the timeline band the blocks (heading, strip, the four notes, the time-field capture) are 48 px apart (32 px on a phone), the strip's bar 16 px under the strip. Measured: gaps 48/48/48 at 1440 and 768, 32/32/32 at 375 and 320; the band is 1057 px high at 1440 (was about 900).

## Timeline: two clear parts

The black timeline section reads as two parts: the recorded strip with the notes 01-03 (Read, Preview, Jump), and a block of its own under a hairline: "04" (small number), a large sub-heading ("Type." / «Введення.»), one sentence and the capture of the time field. Before, the time-field strip stood below the four notes with only a grey caption and looked like a different story.

## Timeline: the time field is a feature, not a fourth item

The block under the notes 01-03 is now labelled as a feature of the player: a small label "Feature" («Особливість»), the large sub-heading "Type the time." («Введіть час.»), one sentence, and the capture of the field. The fourth list item was removed. No claim that no other web player has such a field (not verified); the page only says what the field does.

## The full stop is a triangle

The red full stop after the headline "SIGNAL VIEWPORT" (and after "404" on the 404 page) is now a small red triangle pointing up, standing on the baseline (0.26em wide, 0.2em high, pure CSS `clip-path`), a nod to the pin of the ruler. The black full stops of the section headings stay as they are.

## New section: Any format

After "Responsive", before the black states band: "Any format." (UK «Будь-який формат.»). Three live players of the same film in a 16:9, a 1:1 and a 9:16 frame, side by side on a wide page (one under another below 900 px), the picture filling each frame (cropped, `--media-object-fit: cover`), the panel adapting to the width. The frame ratio comes from `--preview-player-ratio`, the same variable the workbench uses. The three players keep no saved position (`resumeKey=""`) and have no tracks; each loads only its metadata. With the neutral demo video (planned) the square and vertical frames can be real clips instead of crops of the 16:9 film.

## Any format is a sub-section of Responsive

"Any format." is now a sub-section inside "Less space. Same control." (a hairline, the large sub-heading, one sentence, the three frames), not a section of its own; the section order is unchanged otherwise.

## Ruler: no empty stretch on narrow players

Two changes in the ruler (`time-ruler.tsx`, `signal.css`). Minor ticks are no longer dropped on rulers up to 300 px; the tick builder leaves them out only when they would be closer than 7 px. The last major tick names the end of the ruler: when its centered label would run past the right edge, the label is right-aligned to the tick instead of being dropped (so a 10 s film shows 0:00, 0:05, 0:10 on a narrow ruler). The static pictures of the page (gallery, layers, the pair, the timeline recording) still show the old ruler and are to be re-captured in the one pass with the icons.

## Footer on black

The footer is a full-width black band like the bands above it: white text, muted text on dark for the labels and the last line, white links and lines, white focus ring. (Red was considered and not chosen.)

## Restored frame re-captured sharp

The old "Restored" picture came from a 640x360, very low bitrate copy and looked soft. It was re-captured from a 30-second copy of the film at full quality (`apps/preview/_local/restore-30s.mp4`, git-ignored; saved positions need a video longer than 15 s, and a position at least 10 s before the end). The title strip reads "Resumed 0:15". The notes under the picture now say "a 30-second copy" (was "36-minute").

## The soft black

Pure #000000 is replaced by #17151A on all black surfaces. Page: `--ink` in `tokens.css` (text, lines, the black bands, the black buttons); the hard-coded #000 in `demo.css` and `showcase.css` now uses `--ink`; the 404 page too. Skin: a new `--signal-surface` (#17151a) for the title strip, the Play plate, the picture's backing, the menus, chips, the loading plate; `--signal-ink` stays #000000 for text, ticks and the rail on the red panel, because black on that red is 4.61:1 (a soft black there is about 3.95:1 and fails for small text). The static pictures of the page still show pure black surfaces and will be re-captured in the one pass (icons, time font, ruler, colour).

## Texts and hierarchy

The Ukrainian title of the timeline section is now «Керування часом.» (was «Не навмання. До потрібної миті.», unclear). The shortcut keys are set a step smaller (32-48 px) than the sub-heading "Shortcuts." (40-64 px), so the heading leads. The testing block was removed from the landing (the details stay in this file and the README): a half-filled list of what is not tested read as unfinished. Firefox and WebKit (the Safari engine) checks are being prepared with Playwright test builds installed outside the project.

## Shortcuts on the grid

The nine keys now stand on the page's own two columns: the sub-heading "Shortcuts." on the left, the keys (two columns) under the head's text column, so the left edge of the keys matches the head text and the focus pictures (checked at ten widths from 320 to 1920 px). The earlier 32 px indent was removed.

## Navigation: three sub-sections

The section is now "Navigation." (UK «Навігація.») with three named parts on the same two columns: "Shortcuts." (the nine keys), "Preview." (the frame and the time under the pointer, with a capture of the ruler with the hover frame, `preview-hover.webp`) and "Focus." (how to see the keyboard focus). The timeline section (black) keeps its notes Read, Preview, Jump. The new capture shows the soft black and the old ruler/icons; it is part of the one re-capture pass.

## Navigation: Preview removed

The hover frame preview is common in web players, so it is not presented as a feature: the "Preview." sub-section and its capture were removed. "Navigation." keeps "Shortcuts." and "Focus.".

## Mobile adaptation

The section formerly titled "Less space. Same control." is now "Mobile adaptation." (UK «Мобільна адаптація.») with a plain sentence about what it shows: the same player in a narrow window, the ruler keeps its place, the other buttons move to a second row, the settings open inside the player. Its sub-section "Any format." is set at the same size as the heading (not bigger). The English words inside the two captures stay until the Ukrainian re-capture.

## Layers title in English

The English title of the second section is now "Full frame." (UK «Повний кадр.»): the film is seen whole, the controls live on their own surface. The sentence under it and the three words (Title, Picture, Controls) stay.

## Timeline title in English

The English title of the black timeline section is now "Time control." (UK «Керування часом.»).

## Full stops

Section headings (h2) end with a full stop; sub-headings (h3: Shortcuts, Focus, Type the time, Any format) have none. A stop closes a statement, a label does not need one.

## Bug found and fixed: menus with several players on a page

With the "Any format" players added, a settings menu opened next to another player (at 375 px the menu of the first player appeared 7000 px down the page): all players shared the anchor names --signal-viewport and --signal-panel. `.signal-skin` now has `anchor-scope: --signal-viewport, --signal-panel`, so every menu anchors to its own player (checked at 375 and 1440). The two mobile pictures were re-captured with the new ruler (ticks, the end label), the new icons and the soft black. The states section is now titled "Player states." (UK «Стани плеєра.»); the section "Mobile adaptation." keeps its full stop (it is a section heading).

## New section: Preferences

"Preferences." (UK «Уподобання.») sits between the states band and "Your film": four statements set as type on the head's own columns (the second column starts under the head's text): Memory (speed, sound, caption language, position; one command resets), Languages (English and Ukrainian), Accessibility (styles for reduced motion and high contrast, state changes announced to screen readers), Touch (double-tap to seek, centre for fullscreen). Wording says "styles" and "announced", which the code does; none of it has been tested on a real system, so the page does not claim a test.

## Player states: the selector is a ruler

The six state buttons became a ruler: six ticks on one hairline, the label under each tick, and the red pin of the player's ruler standing on the chosen state (muted grey for the others, white for the chosen and on hover). The picture now takes the whole column at its native 1120 px; switching states does not move anything (checked at six widths). Three columns up to 899 px, two below 600 px. Same buttons and keyboard behaviour as before (Tab, Space, Enter).

## Player states: one-line title, selector under the picture

The title is one line ("Player states." / «Стани плеєра.») so the section starts lower on the screen. The picture is as large as the window height allows (selector, picture and caption fit one screen, never below 560 px wide), the ruler selector stands directly under the picture and the caption of the chosen state under the selector, so the player's red control panel and the selector are visible together. The picture's box does not move when a state is chosen (six widths checked).

- Player states caption: now an explanation block under a hairline: state name large (h2-split, uppercase) on the left, the sentence on the head's text column on the right; one column below 720px. The picture is smaller: max-width = max(520px, (100dvh - 330px) * 1120/758), so picture, ruler and caption fit one screen (checked 1440x900, 1024x800, 768, 375, 320; no layout jump, no horizontal scroll).

- Mono theme for the skin: data-theme="mono" on the skin or any ancestor. New panel roles in signal.css: --signal-dim (base ticks, labels, rail), --signal-mark (pin, played ticks, fills), --signal-ring / --signal-ring-gap (focus frame). Mono: white panel, black ink, #6b6b6b quiet parts (5.3:1 on white), black marks, black-outside focus ring, black edge above the panel. Black surfaces unchanged. Contrast check per state is still to do.

- Landing: a Player colour cell (Red / Mono) in the hero panel under Player width; sets data-theme on the hero player's box only. Shown on all widths. Checked 1440 and 375 (no horizontal scroll).

- Player states, vertical: picture left (on a quiet #f0f0f0 backing with equal padding, like the hero's mobile view), on the right a vertical ruler (ticks on one line, red pin pointing right at the chosen state), under it the explanation (state name is not repeated). Below 900px one column: picture, hint, list, explanation. Checked 1440/1024/768/375/320: no jump on switching, no horizontal scroll. Picture no longer limited by window height.

- Time control: the exact-time feature (Type the time) is now the one white plate on the black band: red-square label, large heading left, sentence right (head columns), the real capture across the plate; one column on phones. Player states: the buttons stand on a vertical ruler (line, ticks, red pin); the chosen button is outlined; no backing under the picture.

- Colour in the settings menu: VideoSkin has an opt-in prop themeSwitch (off by default: on a real site the colour is the site's choice). When on, the settings menu gets a Colour submenu (Red / Mono, same radio pattern as Speed). The choice is saved with the other preferences (v1 prefs, optional theme field) and cleared by Reset saved settings. The skin root gets data-signal-theme="mono"; data-theme="mono" on an ancestor still works. The landing's Red / Mono panel and the menu share one store; ?theme=mono on the preview page sets it without saving. Player (hero, workbench, preview) has it on; FormatPlayer does not. Checked: menu, keyboard (Enter, arrows, Esc, focus returns), reload keeps it, Reset clears it, 375px sheet. The g-settings / mob-settings captures do not show the new row yet: re-capture pass.

- Demo film replaced (2026-11-14): the author's own 30-second runway film (three looks: scarlet 0:00, ivory 0:10, black 0:20), received as 854x480 and darker than the old one. Upscaled to 1920x1080 (lanczos, light unsharp) and lifted (eq brightness 0.045, contrast 1.04, gamma 1.12; mean luma 138 to 158, the old film was 155), H.264 crf 22, no audio track, 6.1 MB. New chapters (Scarlet, Ivory, Black), captions (3 cues), storyboard (15 tiles, one per 2 s) and poster (frame at 7 s). The generator is not named anywhere now (it was not stated): README, credits and rights texts say AI-generated by the author. Every showcase picture and both timeline clips were re-captured with the new film and the final skin (Colour row in the menu); the Restored picture now uses the film itself at a saved 0:15 (it is longer than 15 s). The old film and tracks are kept outside the repo (scratchpad/old-film).

## Demo film replaced by "Freefall Bloom" (Nov 14)

- The showcase now plays `apps/preview/public/media/freefall-bloom.mp4`: the author's own 30-second AI-generated anime film (five scenes: night, storm, sky, petals, sunset), 1920x1080, 10.8 MB, with the author's own music (Golden Hour Resolve). The generated 1280x720 footage was upscaled to 1080p with Real-ESRGAN (animevideov3, free, local); no generator credits were used.
- Chapters: Night 0:00, Storm 0:06, Sky 0:11, Petals 0:15, Sunset 0:20. Captions in the same five places. Ruler storyboard: 15 tiles, one every 2 s. Poster from 0:17.
- Texts (credit line, "Demo footage & rights", README) now say the film is AI-generated and the music is the author's; the generator's terms for reuse are still stated as not confirmed.
- Every showcase picture and both timeline clips were re-captured with the new film (frame at 0:17).

## Demo streams from Mux (Nov 14)

- The demo film is uploaded to the author's Mux account (public playback ID, 270p to 1080p renditions, with sound). The showcase and `/preview` play it through `MuxVideo` (HLS), so the settings menu now shows Quality (Auto). The skin and the chapters, captions and ruler preview tracks are unchanged.
- If the Mux stream fails to load, the player restarts once on the bundled `media/freefall-bloom.mp4` (same film), so the page still plays without Mux. The "Format" frames and a file the visitor opens stay on the plain `Video` component.
- Showcase pictures re-captured again on the Mux stream (the settings picture now lists Quality).
- Section headlines end with the ruler's pin (a red triangle, `.sc-stop`) instead of a round full stop, like the product name and the 404 page. Mobile adaptation has no full stop by design.

- Go to time: the field takes digits only and puts the colons in itself, like a timer (the last two digits are seconds: 26 reads 0:26, 126 reads 1:26, 12345 reads 1:23:45); a typed colon changes nothing; Backspace to empty clears it; the mobile keyboard is numeric. Errors still appear only on Enter.

- Landing copy: the Colour note no longer mentions the attribute; the Source line is one line (so the right column ends level with the player in EN and UK); the Settings note now lists Speed, Quality, Captions, Chapters and Colour.

- Error dialog in the idea of the 404 page: a short ruler with the pin past its last tick, the line "This moment is not on the ruler." (Video.js's own title stays as the accessible name), then the friendly sentence, the technical detail line and Try again / OK. The ruler is hidden in small players (container under 560 px). The showcase Error picture was re-captured.

- The three frames in Any format now have the same menu as the main player (Speed, Captions, Chapters, Colour; no Quality, they play the bundled MP4): they carry the chapters, captions and ruler-preview tracks and follow the shared Red/Mono choice.

## Ukrainian pictures and the server code in the error (Nov 14)

- The pictures that show the skin's own words now exist in Ukrainian: `desk-start-uk`, `g-focus-uk`, `g-settings-uk`, `g-captions-uk`, `g-restored-uk`, `g-loading-uk`, `g-error-uk`, `mob-playing-uk`, `mob-settings-uk` (the landing picks the suffix from `?lang=uk`). The pictures that show only numbers and icons (timeline, time field, focus close-ups) are shared by both languages.
- The demo's chapters and captions have a Ukrainian pair (`chapters.uk.vtt`, `captions.uk.vtt`), chosen by the player's language, so the Ukrainian page shows Ukrainian chapters and subtitles.
- The error dialog shows the server's answer big, with the pin as its full stop, when the engine's message carries one ("status 404"); with no answer (offline) only the ruler and the line show. `?nofallback` keeps a Mux failure on screen (the demo normally falls back to the bundled MP4), which is how the Error picture is captured (a real 404 from the stream). The engine's own detail line stays English (it is not translated).
- Checked: every UK string is Cyrillic except key names, "Safari." and the font names.

## Triangles and the error code, simplified (Nov 14)

- The red triangle after section headlines was removed: it read as a show/hide marker. Headlines end with a plain full stop again. The triangle stays only where it is a pure accent: after the product name on the main screen and on the 404 page.
- The error dialog no longer prints a big code. It keeps the ruler with the pin, the line "This moment is not on the ruler." and the grey detail line, which already names the kind of error (for example "status 404"). The Error pictures (EN and UK) were re-captured.
