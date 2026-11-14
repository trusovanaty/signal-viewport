import { I18nProvider, useLocale } from '@videojs/react/i18n';
import { type CSSProperties, StrictMode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '@/skin.css';
import './tokens.css';
import './demo.css';
import './showcase.css';
import './motion.css';
import { initReveal } from './reveal';
import { setSignalTheme, useSignalTheme } from '@/video/shared/preferences';
import { FormatPlayer, MATERIAL, Player, TITLE, type LocalMedia } from '../frame/player';
import { COPY, EXAMPLE, STATES, type Copy, type StateKey } from './copy';

// The showcase page. One real player at the top; everything below is captured from this same build (images and a
// short clip, labeled as recordings). The workbench (`workbench.html`) is a separate page for testing.
// The language comes from the address (`?lang=uk`) and defaults to English; the skin and the page both follow it.
const params = new URLSearchParams(location.search);
const LOCALE = (params.get('lang') ?? 'en').trim() || 'en';

const SHOWCASE = './showcase/';
/** The pictures that show the skin's own words (status, menu, error) exist in each language: `name-uk.webp` for Ukrainian. */
const SUFFIX = LOCALE.startsWith('uk') ? '-uk' : '';
const REPO = 'https://github.com/trusovanaty/signal-viewport';
/** Measured widths of the captured frames: a 375 px window holds a 343 px player, a 320 px window a 288 px one. */
const FRAMES = { wide: 1120, window: 375, narrow: 343, narrowHeight: 383 };
/** Sizes of the captured pictures (CSS px of the player crop times two for the sharp interface fragments). */
const TL_WIDE = { w: 1952, h: 454 };
const TL_NARROW = { w: 686, h: 600 };
/**
 * The state pictures: six full frames of the same player, captured in one session at one size (1120 x 758) and one
 * geometry, so the title strip, the picture and the red panel sit at the same place in every one of them. They are shown
 * at one scale, in one reserved stage, without cropping.
 */
const STATE_IMAGE: Record<StateKey, string> = {
  focus: 'g-focus',
  settings: 'g-settings',
  captions: 'g-captions',
  restored: 'g-restored',
  loading: 'g-loading',
  error: 'g-error',
};
const FRAME = { w: 1120, h: 758 };

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line) => (
        <span key={line} className="sc-line">
          {line}{' '}
        </span>
      ))}
    </>
  );
}

function Hero({ copy, locale }: { copy: Copy; locale: string }) {
  const lang = locale.split('-')[0];
  return (
    <header className="demo-head">
      <div className="demo-top">
        <p className="demo-label">
          <span className="demo-label-text">
            <span>{copy.kicker}</span>
            <span>{copy.hint}</span>
          </span>
        </p>
        <nav className="demo-lang" aria-label="Language">
          <a href="?lang=en" aria-current={lang === 'en' ? 'true' : undefined} hrefLang="en" lang="en">
            EN
          </a>
          <a href="?lang=uk" aria-current={lang === 'uk' ? 'true' : undefined} hrefLang="uk" lang="uk">
            UK
          </a>
        </nav>
      </div>
      {/* The product name is the page's headline; it stays in Latin letters in both languages. */}
      <h1 className="demo-title" lang="en">
        <span>Signal</span>{' '}
        <span>
          Viewport
          <span className="demo-dot" aria-hidden="true" />
        </span>
      </h1>
      {/* One hairline with ticks and one red pointer at zero: the idea of the timeline, no content. */}
      <div className="demo-ruler" aria-hidden="true">
        <span className="demo-ruler-ticks" />
        <span className="demo-ruler-pin" />
      </div>
    </header>
  );
}

function Intro({ copy }: { copy: Copy }) {
  return (
    <div className="demo-intro">
      <p className="demo-tagline">
        <Lines text={copy.tagline} />
      </p>
      <p className="demo-lead">{copy.lead}</p>
    </div>
  );
}

/**
 * A first, cheap look at a chosen file, before the browser is asked to play it. A video MIME type or a video extension
 * is a good sign; an empty or generic type is not a reason to refuse (some real videos arrive that way); an image, text,
 * audio or other clearly different type is refused. Whatever passes is handed to the player, and what the browser then
 * does with the file (plays it, or fails) is the real answer. Nothing here promises that every format plays.
 */
const VIDEO_EXTENSION = /\.(mp4|m4v|mov|webm|ogv|ogg|mkv|avi|mpg|mpeg|3gp|3g2|ts|mts|m2ts|wmv|flv)$/i;
function looksLikeVideo(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type.startsWith('video/')) return true;
  if (VIDEO_EXTENSION.test(file.name)) return true;
  return type === '' || type === 'application/octet-stream';
}

type View = 'desktop' | 'mobile';
type Theme = 'red' | 'mono';

function Credit({
  copy,
  locale,
  local,
  onPick,
  onRestore,
  notVideo,
  failed,
  view,
  onView,
  theme,
  onTheme,
}: {
  copy: Copy;
  locale: string;
  local: LocalMedia | null;
  onPick: (file: File) => void;
  onRestore: () => void;
  notVideo: boolean;
  failed: boolean;
  view: View;
  onView: (view: View) => void;
  theme: Theme;
  onTheme: (theme: Theme) => void;
}) {
  const about = MATERIAL.about ? (locale.startsWith('uk') && MATERIAL.isDemo ? copy.about : MATERIAL.about) : null;
  const input = useRef<HTMLInputElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  return (
    <div className="demo-credit">
      {/* Desktop / Mobile: the same player in a 375 px container. It only changes the container's width; the player is
          not remounted, so playback, position and an opened file stay as they are. Not shown on a narrow page. */}
      <div className="demo-cell demo-view-cell">
        <span className="demo-cell-label">{copy.view.group}</span>
        <div className="demo-view" role="group" aria-label={copy.view.group}>
          {(['desktop', 'mobile'] as const).map((key) => (
            <button key={key} type="button" aria-pressed={view === key} onClick={() => onView(key)}>
              {copy.view[key]}
            </button>
          ))}
        </div>
      </div>
      {/* Red / Mono: the skin's second theme (data-theme on the player's box). Only the colours change. */}
      <div className="demo-cell demo-theme-cell">
        <span className="demo-cell-label">{copy.theme.group}</span>
        <div className="demo-view" role="group" aria-label={copy.theme.group}>
          {(['red', 'mono'] as const).map((key) => (
            <button key={key} type="button" aria-pressed={theme === key} onClick={() => onTheme(key)}>
              {copy.theme[key]}
            </button>
          ))}
        </div>
        <p className="demo-note">{copy.theme.note}</p>
      </div>
      <div className="demo-cell demo-local">
        <span className="demo-cell-label">{copy.local.region}</span>
        <div className="demo-actions">
          {/* A real file input, hidden; the button opens the browser's own file chooser. Nothing is uploaded. */}
          <input
            ref={input}
            type="file"
            accept="video/*,.mp4,.m4v,.mov,.webm,.ogv,.mkv,.avi,.mpg,.mpeg,.3gp"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file) return; // the chooser was cancelled: nothing changes
              onPick(file);
              // Focus stays on the button that opened the chooser, whatever happens to the player below it.
              openButton.current?.focus();
            }}
          />
          <button ref={openButton} type="button" className="sc-btn" onClick={() => input.current?.click()}>
            {copy.local.open}
          </button>
          {local ? (
            <button
              type="button"
              className="sc-btn"
              onClick={() => {
                onRestore();
                // This button disappears with the local file, so focus moves to the one that stays.
                openButton.current?.focus();
              }}
            >
              {copy.local.restore}
            </button>
          ) : null}
        </div>
        {/* Before a file is chosen: what the button does. After: the file stays in this browser. */}
        <p className="demo-note" role={local ? 'status' : undefined}>
          {local ? copy.local.note : copy.local.hint}
        </p>
        {notVideo || failed ? (
          <p className="demo-error" role="alert">
            {notVideo ? copy.local.notVideo : copy.local.cannotPlay}
          </p>
        ) : null}
      </div>
      <div className="demo-cell demo-source">
        <span className="demo-cell-label">{copy.source}</span>
        {local ? (
          // The file's name is shown as plain text only (React escapes it); it is never stored or sent anywhere.
          <strong className="demo-localname">{local.name}</strong>
        ) : (
          <>
            <span className="demo-source-name">
              <strong>{TITLE}</strong>
              {MATERIAL.isDemo ? <span className="demo-tag">{copy.demoTag}</span> : null}
              {MATERIAL.author ? <span>{MATERIAL.author}</span> : null}
            </span>
            {about ? <span className="demo-about">{about}</span> : null}
          </>
        )}
      </div>
    </div>
  );
}

function SectionHead({ id, title, text }: { id: string; title: string; text?: string }) {
  return (
    <div className="sc-head">
      <h2 id={id}>
        <Lines text={title} />
      </h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

/**
 * A still diagram of the three layers: the title strip, the picture and the red panel are three real slices of one captured
 * frame (cut at its real heights, 40, 630 and 88 px of 758, so each keeps its proportions and all have the same width),
 * set a little apart. The numbers and the guide stand outside the slices. It is one illustration for assistive
 * technology (the numbers and lines are decoration); the slices are pictures, not controls.
 */
const LAYER_PARTS = ['strip', 'picture', 'panel'] as const;

function Layers({ copy }: { copy: Copy['layers'] }) {
  return (
    <section className="sc-section sc-layers" aria-labelledby="sc-layers">
      <SectionHead id="sc-layers" title={copy.title} text={copy.text} />
      <div className="sc-layers-body">
        {/* The three layers as type: the name large, the number and one line beside it. */}
        <ol className="sc-layer-words">
          {copy.items.map(([name, text], i) => (
            <li key={name}>
              <span className="sc-num">{String(i + 1).padStart(2, '0')}</span>
              <b>{name}</b>
              <span className="sc-note-text">{text}</span>
            </li>
          ))}
        </ol>
        <figure className="sc-schema">
          <div className="sc-explode" role="img" aria-label={copy.alt}>
            {LAYER_PARTS.map((part, i) => (
              <div key={part} className="sc-layer" aria-hidden="true">
                <span className="sc-node">{String(i + 1).padStart(2, '0')}</span>
                <div className="sc-slice" data-part={part} style={{ backgroundImage: `url(${SHOWCASE}desk-start${SUFFIX}.webp)` }} />
              </div>
            ))}
          </div>
          <figcaption>{copy.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}

function Timeline({ copy }: { copy: Copy['timeline'] }) {
  const wide = useRef<HTMLVideoElement>(null);
  const narrow = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // The clip that is visible at this width: the wide interface strip, or the narrow fragment on phones.
  const current = () => (wide.current && wide.current.offsetParent !== null ? wide.current : narrow.current);
  const toggle = () => {
    const el = current();
    if (!el) return;
    if (el.paused) void el.play().catch(() => undefined);
    else el.pause();
  };
  const events = {
    muted: true,
    playsInline: true,
    preload: 'none' as const,
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onEnded: () => setPlaying(false),
  };
  return (
    <div className="sc-band sc-band--first">
      <section className="sc-section sc-timeline" aria-labelledby="sc-timeline">
        <SectionHead id="sc-timeline" title={copy.title} text={copy.text} />
        <figure className="sc-clip">
          {/* Recordings, not controls: silent, no autoplay, no controls of their own; the button below starts them. */}
          <video
            ref={wide}
            className="sc-clip-wide"
            src={`${SHOWCASE}timeline-wide.mp4`}
            poster={`${SHOWCASE}tl-wide.webp`}
            width={TL_WIDE.w}
            height={TL_WIDE.h}
            aria-label={copy.alt}
            {...events}
          />
          <video
            ref={narrow}
            className="sc-clip-narrow"
            src={`${SHOWCASE}timeline-narrow.mp4`}
            poster={`${SHOWCASE}tl-narrow.webp`}
            width={TL_NARROW.w}
            height={TL_NARROW.h}
            aria-label={copy.alt}
            {...events}
          />
          <figcaption className="sc-clip-bar">
            <button type="button" className="sc-btn" onClick={toggle}>
              {playing ? copy.pause : copy.play}
            </button>
            <span>{copy.recorded}</span>
          </figcaption>
        </figure>
        <dl className="sc-trio">
          {copy.items.slice(0, 3).map(([term, text], i) => (
            <div key={term}>
              <dt>
                <span className="sc-num">{String(i + 1).padStart(2, '0')}</span> {term}
              </dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
        {/* The fourth part has its own heading and picture: the exact-time field, a capture of the real control panel. */}
        <div className="sc-type">
          <span className="sc-feature-label">{copy.feature.label}</span>
          <h3 className="sc-sub-heading">{copy.feature.heading}</h3>
          <p>{copy.goto}</p>
          <figure className="sc-goto">
            <img className="sc-goto-wide" src={`${SHOWCASE}goto-wide.webp`} width={1816} height={176} alt={copy.gotoAlt} loading="lazy" />
            <img className="sc-goto-narrow" src={`${SHOWCASE}goto-narrow.webp`} width={750} height={300} alt={copy.gotoAlt} loading="lazy" />
          </figure>
        </div>
      </section>
    </div>
  );
}

function Responsive({ copy, formats }: { copy: Copy['responsive']; formats: Copy['formats'] }) {
  // Both states were captured in one window (375 px) with one player width (343 px), so they are shown as a pair: two
  // equal columns, one frame size, labels above and captions below at shared levels.
  const frames = [
    { src: 'mob-playing', label: copy.labels[0], text: copy.playing, alt: copy.alts.playing },
    { src: 'mob-settings', label: copy.labels[1], text: copy.sheet, alt: copy.alts.sheet },
  ];
  return (
    <section className="sc-section sc-responsive" aria-labelledby="sc-responsive">
      <div className="sc-responsive-text">
        <h2 id="sc-responsive">
          <Lines text={copy.title} />
        </h2>
        <p>{copy.text}</p>
      </div>
      {frames.map((frame) => (
        <figure key={frame.src} className="sc-frame sc-pair">
          <p className="sc-pair-label">{frame.label}</p>
          <img
            src={`${SHOWCASE}${frame.src}${SUFFIX}.webp`}
            width={FRAMES.narrow}
            height={FRAMES.narrowHeight}
            alt={frame.alt}
            loading="lazy"
            decoding="async"
          />
          <figcaption>
            <b>{frame.text}</b>
            <span className="sc-tech">{copy.windowPlayer(FRAMES.window, FRAMES.narrow)}</span>
          </figcaption>
        </figure>
      ))}
      {/* A sub-section of this one: the same controls in frames of other shapes. */}
      <Formats copy={formats} />
    </section>
  );
}

function States({ copy }: { copy: Copy['states'] }) {
  const [active, setActive] = useState<StateKey>('focus');
  return (
    <div className="sc-band">
      <section className="sc-section sc-states" aria-labelledby="sc-states">
        <SectionHead id="sc-states" title={copy.title} text={copy.text} />
        <div className="sc-states-body">
          <figure className="sc-shot">
            {/* One stage for every state: a fixed aspect ratio, all six pictures stacked in it, one visible at a time.
                Switching changes only which picture shows, so nothing moves or loads. */}
            <div className="sc-shot-box">
              {STATES.map((key) => (
                <img
                  key={key}
                  className="sc-shot-img"
                  data-active={active === key ? '' : undefined}
                  src={`${SHOWCASE}${STATE_IMAGE[key]}${SUFFIX}.webp`}
                  width={FRAME.w}
                  height={FRAME.h}
                  alt={copy.alts[key]}
                  decoding="async"
                />
              ))}
            </div>
            {/* The captions share one grid cell, so the cell is as tall as the longest one (in this language and at this
                text size) and does not change with the state. They are not cut: if the text grows, the cell grows. */}
            <div className="sc-shot-caps" aria-hidden="true">
              {STATES.map((key) => (
                <p key={key} className="sc-cap" data-active={active === key ? '' : undefined}>
                  <b>{copy.labels[key]}</b>
                  <span>{copy.notes[key]}</span>
                </p>
              ))}
            </div>
            <p className="sc-sr" role="status">
              {copy.labels[active]}. {copy.notes[active]}
            </p>
          </figure>
          <p className="sc-hint">{copy.hint}</p>
          <div className="sc-toggles" role="group" aria-label={copy.group}>
            {STATES.map((key, i) => (
              <button key={key} type="button" aria-pressed={active === key} onClick={() => setActive(key)}>
                <span className="sc-num">{String(i + 1).padStart(2, '0')}</span>
                {copy.labels[key]}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Keyboard({ copy, keys }: { copy: Copy['keyboard']; keys: [string, string][] }) {
  return (
    <section className="sc-section sc-keyboard" aria-labelledby="sc-keyboard">
      <SectionHead id="sc-keyboard" title={copy.title} text={copy.text} />
      {/* The keys as type: the main key of each shortcut set large, the other keys small, then what it does. */}
      <div className="sc-shortcuts">
        <h3 className="sc-sub-heading sc-shortcuts-heading">{copy.keysTitle}</h3>
        <p>{copy.keysText}</p>
        <ul className="sc-keycaps" aria-label={copy.keysTitle}>
          {keys.map(([k, what], i) => {
            const [main, ...rest] = k.split(', ');
            return (
              <li key={k} className="sc-keycap" data-first={i === 0 ? '' : undefined}>
                <span className="sc-keycap-key">{main}</span>
                <span className="sc-keycap-alt">{rest.length ? `${copy.or} ${rest.join(', ')}` : ''}</span>
                <span className="sc-keycap-what">{what}</span>
              </li>
            );
          })}
        </ul>
      </div>
      {/* A short guide for people who have not used the keyboard on a player: how to get focus, and what it looks like. */}
      <div className="sc-focus">
        <div>
          <h3 className="sc-sub-heading">{copy.focus.heading}</h3>
          <p className="sc-focus-title">{copy.focus.title}</p>
          <p>{copy.focus.text}</p>
        </div>
        <div className="sc-focus-figs">
          <figure>
            <img src={`${SHOWCASE}focus-marker.webp`} width={720} height={176} alt={copy.focus.markerAlt} loading="lazy" />
            <figcaption>{copy.focus.marker}</figcaption>
          </figure>
          <figure>
            <img src={`${SHOWCASE}focus-button.webp`} width={720} height={176} alt={copy.focus.buttonAlt} loading="lazy" />
            <figcaption>{copy.focus.button}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

const FORMAT_RATIOS = ['16 / 9', '1 / 1', '9 / 16'] as const;

/** The same film in three frames: wide, square and vertical. The picture fills each frame (cropped), the panel adapts. */
function Formats({ copy }: { copy: Copy['formats'] }) {
  return (
    <div className="sc-formats">
      <h3 className="sc-sub-heading">{copy.title}</h3>
      <p>{copy.text}</p>
      <div className="sc-formats-row">
        {copy.items.map(([ratio, name], i) => (
          <figure key={ratio} className="sc-format" style={{ '--preview-player-ratio': FORMAT_RATIOS[i], '--media-object-fit': 'cover' } as CSSProperties}>
            <FormatPlayer />
            <figcaption>
              <span>{ratio}</span> {name}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

/** What the player remembers and respects: four short statements, set as type like the shortcuts. */
function Preferences({ copy }: { copy: Copy['prefs'] }) {
  return (
    <section className="sc-section sc-prefs" aria-labelledby="sc-prefs">
      <SectionHead id="sc-prefs" title={copy.title} text={copy.text} />
      <ul className="sc-prefs-list">
        {copy.items.map(([word, text]) => (
          <li key={word}>
            <h3 className="sc-sub-heading">{word}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// The two link arrows are drawn, not typed: one 2px square-ended line weight, the same on both, in the button's colour.
function Arrow({ kind }: { kind: 'out' | 'right' }) {
  return (
    <svg className="sc-arrow" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d={kind === 'out' ? 'M3 13 13 3M5 3h8v8' : 'M2 8h12M9 3l5 5-5 5'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

function Use({ copy }: { copy: Copy['use'] }) {
  return (
    <section className="sc-section sc-use" aria-labelledby="sc-use">
      <SectionHead id="sc-use" title={copy.title} text={copy.text} />
      <p className="sc-links">
        <a className="sc-linkbtn" href={REPO}>
          {copy.source} <Arrow kind="out" />
        </a>
        <a className="sc-linkbtn" href="./workbench.html">
          {copy.workbench} <Arrow kind="right" />
        </a>
      </p>
      <details className="sc-details">
        <summary>{copy.exampleTitle}</summary>
        <pre className="sc-code" tabIndex={0}>
          <code>{EXAMPLE}</code>
        </pre>
      </details>
    </section>
  );
}

function Footer({ copy }: { copy: Copy['footer'] }) {
  return (
    <footer className="sc-footer">
      <dl className="sc-groups">
        {copy.groups.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <details className="sc-details sc-details--small">
        <summary>{copy.rightsTitle}</summary>
        <div className="sc-rights">
          {copy.rights.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </details>
      <p className="sc-licenses">
        <a className="sc-link" href={`${REPO}/blob/main/LICENSE`}>
          Apache 2.0
        </a>
        <a className="sc-link" href="./font-licenses/OFL-Onest.txt">
          OFL — Onest
        </a>
        <a className="sc-link" href="./font-licenses/OFL-IBMPlexMono.txt">
          OFL — IBM Plex Mono
        </a>
      </p>
      <p className="sc-contest">{copy.contest}</p>
    </footer>
  );
}

function Demo() {
  const locale = useLocale();
  const copy = COPY[locale] ?? COPY[locale.split('-')[0] ?? 'en'] ?? COPY.en!;
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  // Sections arrive once as they come into view (before the first paint, so nothing flashes); a no-op with reduced motion.
  useLayoutEffect(() => initReveal(), []);
  // A video opened from the visitor's computer. The blob address lives only in this tab; it is released when another
  // source replaces it, when the demo is restored, and when the page closes.
  const [local, setLocal] = useState<LocalMedia | null>(null);
  const [notVideo, setNotVideo] = useState(false);
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState<View>('desktop');
  // The colour is the skin's own saved choice: the panel switch and the player's settings menu change the same value.
  const theme = useSignalTheme();
  useEffect(() => {
    const url = local?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [local?.url]);
  const pick = (file: File) => {
    if (!looksLikeVideo(file)) {
      setNotVideo(true);
      return;
    }
    setNotVideo(false);
    setFailed(false);
    setLocal({ url: URL.createObjectURL(file), name: file.name });
  };
  const restore = () => {
    setNotVideo(false);
    setFailed(false);
    setLocal(null);
  };
  // The player's width is limited by the height of the window, so the whole player (picture and red panel) fits in the
  // first screen. The page only tells CSS where the player starts; the video keeps its 16:9 and nothing is scaled.
  useLayoutEffect(() => {
    const head = document.querySelector('.demo-head');
    if (!head) return undefined;
    const set = () => {
      const bottom = head.getBoundingClientRect().bottom + window.scrollY;
      document.documentElement.style.setProperty('--demo-above', `${Math.round(bottom + 14)}px`);
    };
    set();
    const observer = new ResizeObserver(set);
    observer.observe(head);
    window.addEventListener('resize', set);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', set);
    };
  }, [locale]);
  // The desktop player's height is kept while the mobile view is on, so the backing keeps its size and the sections
  // below do not move when the view is switched.
  const playerBox = useRef<HTMLDivElement>(null);
  const [desktopHeight, setDesktopHeight] = useState<number | null>(null);
  useLayoutEffect(() => {
    const box = playerBox.current;
    if (!box || view !== 'desktop') return undefined;
    const set = () => setDesktopHeight(Math.round(box.getBoundingClientRect().height));
    set();
    const observer = new ResizeObserver(set);
    observer.observe(box);
    return () => observer.disconnect();
  }, [view]);
  return (
    <>
      <div className="sc-wrap">
        <div className="demo-hero">
          <Hero copy={copy} locale={locale} />
          <div className="demo-stage">
            <div className="demo-player" data-view={view} data-theme={theme === 'mono' ? 'mono' : undefined} ref={playerBox} style={view === 'mobile' && desktopHeight ? { minHeight: desktopHeight } : undefined}>
              <Player local={local} onLocalError={() => setFailed(true)} onLocalReady={() => setFailed(false)} />
            </div>
            <div className="demo-side">
              <Intro copy={copy} />
              <Credit copy={copy} locale={locale} local={local} onPick={pick} onRestore={restore} notVideo={notVideo} failed={failed} view={view} onView={setView} theme={theme} onTheme={setSignalTheme} />
            </div>
          </div>
        </div>
      </div>
      <div className="sc-wrap">
        <Layers copy={copy.layers} />
      </div>
      <Timeline copy={copy.timeline} />
      <div className="sc-wrap">
        <Keyboard copy={copy.keyboard} keys={copy.keys} />
        <Responsive copy={copy.responsive} formats={copy.formats} />
      </div>
      <States copy={copy.states} />
      <div className="sc-wrap">
        <Preferences copy={copy.prefs} />
        <Use copy={copy.use} />
      </div>
      {/* The footer closes the page on black, like the black bands above it. */}
      <div className="sc-band sc-band--footer">
        <div className="sc-footer-wrap">
          <Footer copy={copy.footer} />
        </div>
      </div>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider locale={LOCALE}>
      <Demo />
    </I18nProvider>
  </StrictMode>
);
