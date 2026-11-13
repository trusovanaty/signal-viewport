# Landing page design system

Scope: the showcase page (`apps/preview/src/demo/`). The player skin keeps its own tokens in `src/styles/signal.css` and its decisions in `design/spec.md`; this system does not change them.

Source of truth: `apps/preview/src/demo/tokens.css`. `demo.css` and `showcase.css` use only these tokens for type, line height, colour roles, spacing, rules, measure and control height. A new value is added to `tokens.css` first.

## Type

| Token | Size | Use |
|---|---|---|
| `--fs-label` | 13 px, IBM Plex Mono, caps, `--ls-label` | numbers, tags, captions of the clip bar |
| `--fs-small` | 14 px | notes, figure captions, footer, legal |
| `--fs-body` | 16 px | reading text, list items, buttons |
| `--fs-lead` | 18 px | section intro, summaries, small titles |
| `--fs-h3` | 20 px | titles inside a row of items |
| `--fs-h2`, `--fs-h2-small`, `--fs-h2-split` | fluid | section headings (large, small, beside a diagram) |

Hero headline and lead keep their own fluid sizes (they are fitted to the screen height by the hero-fit rule).

Weights: 600 for headings and titles, 500 for labels and buttons.

## Line height

- Text (small, body, lead): `--lh-text` = 1.5.
- Headings: `--lh-heading` = 1.05. Large display headings: `--lh-display` = 0.96.
- Letter spacing: labels `--ls-label` 0.04em; large headings `--ls-display` -0.03em; smaller headings `--ls-heading` -0.02em.

## Colour (page)

| Token | Value | Role | Contrast |
|---|---|---|---|
| `--ink` | #000 | text, rules, dark surfaces | |
| `--paper` | #fff | page, text on dark | |
| `--ink-muted` | #4d4d4d | secondary text on white | 8.4:1 |
| `--ink-muted-on-dark` | #9a9a9a | secondary text on black | 7.6:1 |

Two muted greys only, one per background. The red of the player belongs to the skin, not to the page.

## Spacing

4 px base: `--space-1..7` = 4, 8, 12, 16, 24, 32, 48. Gaps and margins use these. Section rhythm: `--space-section` (fluid 48–88 px) above every section; `--space-footer` above the footer.

Rules: `--rule` 1 px, `--rule-strong` 2 px (section heads, testing block, buttons).

## Measure (line length)

`--measure-s` 34em for intros and notes; `--measure-m` 48em for long lists and captions; `--page-max` 1184 px for the page column.

## Controls

`--ctl-h` 44 px (touch minimum): buttons, language and view switches, small disclosures. `--ctl-h-lg` 52 px: large toggles, link buttons, main disclosures. Focus ring: 3 px, black on white and white on black (unchanged).

## What was found and unified

Before: 13 different font sizes (13, 14, 15, 16, 17, 18, 20, 22 and fluid ones), 9 line heights (20, 21, 22, 24, 26 px and 0.96, 0.98, 1.05, 1.4), three greys on dark and white (#4d4d4d, #8c8c8c, #9a9a9a), gaps of 5, 6, 10, 14, 18, 28 px, six text measures (22, 30, 34, 46, 54, 60 em), control heights 36, 44, 52.

After: 5 text sizes, 3 line-height values, 2 muted greys, a 4 px spacing scale, 2 measures, 2 control heights. 155 declarations were switched to tokens.

Visible effects: 15 px and 17 px text became 16 px (14 px for figure captions) and 18 px; 36 px switches became 44 px (header is a little taller, the demo player 15 px narrower on a 1440×900 screen); section and page heights changed by 1–2 % (for example 5083 → 5053 px at 1440 px EN). Layout is stable: no horizontal scroll at 320, 375, 768 and 1440 px, no console errors.

## Known exceptions (not tokens)

- 12 px labels and the 22 px "+" icon inside the layers diagram and disclosure summaries.
- Hero headline and lead (fluid, tied to the hero-fit rule).
- Sizes inside the player: they belong to the skin.

## Rule for new work

Pick a size from the scale, line height 1.5, spacing from the 4 px scale, one of the two measures, one of the two control heights. If nothing fits, change the token, not the single rule.

## First screen (accepted variant C)

Structure: top line (red square + kicker, language switch) → headline "SIGNAL VIEWPORT." (the product name, Latin in both languages, red full stop) → one ruler line with ticks and a red pointer at zero → the real player and a panel.

- **Headline:** sized from the header width (`cqw`): 10.1 at 1200+, 10.8 at 720+, 17.5 on a phone (two lines). Line height 0.86, `--ls-title`.
- **Ruler:** decoration only (`aria-hidden`), 22 px high, ticks 16/80 px (12/60 px on a phone), pointer in `--accent` (the skin's red).
- **1200 px and wider:** the hero is wider than the text column below (up to 1344 px); the player is on the left, the panel (slogan, lead, blocks) on the right. The player's width is the smaller of the space left and the width the window height allows (16:9 + 40 px strip + 88 px panel), never below 560 px, so the red control panel is inside the first screen.
- **720–1199 px:** the player full width (also limited by height); under it two columns: slogan and lead | blocks.
- **Under 720 px:** one column; the Desktop / Mobile group is hidden (it only matters on a wide page).
- **Panel blocks** (hairline + mono label): Player width (Desktop / Mobile), Your video (open, restore, note, errors), a link to the keyboard section (the list of keys is not in the panel, so the panel never grows), Source (video title, "Demo footage" tag and origin, quiet muted text, at the bottom). The origin of the video stays visible and does not compete with the headline.
- No shadows, glass, gradients as decoration (the ticks are hard-edged lines), frames or animation.

## Heading to text

One value everywhere: `--space-heading` = 12 px, from a heading (h2, h3, h4, the first-screen slogan) to the text that belongs to it. Measured at 1440 and 375 (UK): first screen, layers, timeline, responsive, keyboard, "Your film", testing — all 12 px. List item titles (title + one line, like "01 Read") keep the tighter `--space-1`.

## Lines

Two thicknesses, one rule. **2 px** (`--rule-strong`): the start of a section, the page footer, and the outline of a control (button, tag, code box). **1 px** (`--rule`): every divider inside a section: the blocks of the first-screen panel, list items, disclosure rows ("Integration example", "Testing details", "Demo footage & rights"), the testing block, the column heads of the keyboard section. A thick line always means "a new part of the page starts here".
