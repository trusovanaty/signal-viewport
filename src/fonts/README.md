# Fonts

The skin ships two typefaces, as local `woff2` files (no third-party font service at runtime):

| Typeface | Used for | Weights | Scripts loaded | License |
| --- | --- | --- | --- | --- |
| **Onest** | video title, menus, dialogs, captions | 500, 600 | latin, latin-ext, cyrillic, cyrillic-ext | SIL Open Font License 1.1 — [`OFL-Onest.txt`](./OFL-Onest.txt) (Copyright 2021 The Onest Project Authors) |
| **IBM Plex Mono** | time, ruler labels, status, chapter, technical labels | 400, 500 | latin, latin-ext, cyrillic | SIL Open Font License 1.1 — [`OFL-IBMPlexMono.txt`](./OFL-IBMPlexMono.txt) |

- **These files are not under the code's license.** The skin's source code is licensed separately (Apache License 2.0
  in the repository root); the font files stay under the SIL OFL 1.1 above. If you redistribute the fonts, keep the
  copyright notices and license text in this folder with them.
- The files are the subsets published by [Fontsource](https://fontsource.org) (`@fontsource/onest` 5.3.1 and
  `@fontsource/ibm-plex-mono` 5.3.0), taken as they are, without modification. They are not installed as project
  dependencies.
- Cyrillic is covered by the main fonts, so Ukrainian and Russian titles, menus and captions are set in Onest rather than
  in a system fallback (Ukrainian І, Ї, Є, Ґ and the modifier apostrophe ʼ included). The system sans-serif stays only as
  a safety net for characters and scripts the files do not contain (for example Greek or CJK).
- Only real weights are loaded and `font-synthesis: none` is set, so the browser never fakes a bold or an italic.
