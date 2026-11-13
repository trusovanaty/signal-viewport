import { I18nProvider, useLocale } from '@videojs/react/i18n';
import { StrictMode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '@/skin.css';
import './demo.css';
import './showcase.css';
import { MATERIAL, Player, TITLE, type LocalMedia } from '../frame/player';
import { COPY, EXAMPLE, STATES, type Copy, type StateKey } from './copy';

// The showcase page. One real player at the top; everything below is captured from this same build (images and a
// short clip, labeled as recordings). The workbench (`workbench.html`) is a separate page for testing.
// The language comes from the address (`?lang=uk`) and defaults to English; the skin and the page both follow it.
const params = new URLSearchParams(location.search);
const LOCALE = (params.get('lang') ?? 'en').trim() || 'en';

const SHOWCASE = './showcase/';
const REPO = 'https://github.com/trusovanaty/signal-viewport';
/** Measured widths of the captured frames: a 375 px window holds a 343 px player, a 320 px window a 288 px one. */
const FRAMES = { wide: 1120, narrow: 343, narrowest: 288 };
/** Sizes of the captured pictures (CSS px of the player crop times two for the sharp interface fragments). */
const TL_WIDE = { w: 2240, h: 520 };
const TL_NARROW = { w: 686, h: 600 };
/**
 * The state pictures. Each one is a real capture of the player; the close crops were captured at 2x so they stay sharp at
 * the size they are shown (w and h are the picture's own pixel size). Focus, settings, restored and error are tight on
 * the part of the interface the state is about; captions and loading keep the whole frame.
 */
const STATE_IMAGE: Record<StateKey, { file: string; w: number; h: number }> = {
  focus: { file: 'g-focus-close', w: 1280, h: 380 },
  settings: { file: 'g-settings-close', w: 1120, h: 660 },
  captions: { file: 'g-captions', w: 1120, h: 758 },
  restored: { file: 'g-restored-close', w: 1120, h: 340 },
  loading: { file: 'g-loading', w: 1120, h: 758 },
  error: { file: 'g-error-close', w: 1280, h: 660 },
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
          <span>Signal Viewport</span>
          <span>{copy.kicker}</span>
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
      <h1 className="demo-tagline">
        <Lines text={copy.tagline} />
      </h1>
      <p className="demo-lead">{copy.lead}</p>
    </header>
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

function Credit({
  copy,
  locale,
  local,
  onPick,
  onRestore,
  notVideo,
  failed,
}: {
  copy: Copy;
  locale: string;
  local: LocalMedia | null;
  onPick: (file: File) => void;
  onRestore: () => void;
  notVideo: boolean;
  failed: boolean;
}) {
  const about = MATERIAL.about ? (locale.startsWith('uk') && MATERIAL.isDemo ? copy.about : MATERIAL.about) : null;
  const input = useRef<HTMLInputElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  return (
    <div className="demo-credit">
      <div className="demo-credit-main">
        {local ? (
          <>
            {/* The file's name is shown as plain text only (React escapes it); it is never stored or sent anywhere. */}
            <strong className="demo-localname">{local.name}</strong>
            <span className="demo-about" role="status">
              {copy.local.note}
            </span>
          </>
        ) : (
          <>
            <strong>{TITLE}</strong>
            {MATERIAL.isDemo ? <span className="demo-tag">{copy.demoTag}</span> : null}
            {MATERIAL.author ? <span>{MATERIAL.author}</span> : null}
            {about ? <span className="demo-about">{about}</span> : null}
          </>
        )}
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
        {notVideo || failed ? (
          <span className="demo-about" role="alert">
            {notVideo ? copy.local.notVideo : copy.local.cannotPlay}
          </span>
        ) : null}
      </div>
      <div className="demo-credit-keys">
        <p className="demo-hint">{copy.hint}</p>
        <details className="sc-details sc-details--small">
          <summary>{copy.keysTitle}</summary>
          <dl className="demo-keys">
            {copy.keys.map(([keys, what]) => (
              <div key={keys}>
                <dt>{keys}</dt>
                <dd>{what}</dd>
              </div>
            ))}
          </dl>
        </details>
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

function Layers({ copy }: { copy: Copy['layers'] }) {
  return (
    <section className="sc-section sc-layers" aria-labelledby="sc-layers">
      <div className="sc-layers-text">
        <h2 id="sc-layers" className="sc-h2--small">
          {copy.title}
        </h2>
        <p>{copy.text}</p>
        <ol className="sc-legend">
          {copy.items.map(([name, text], i) => (
            <li key={name}>
              <span className="sc-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="sc-legend-text">
                <b>{name}</b>
                <span>{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <figure className="sc-layers-frame">
        <img src={`${SHOWCASE}desk-start.webp`} width={FRAME.w} height={FRAME.h} alt={copy.alt} loading="lazy" decoding="async" />
        <span className="sc-mark" data-n="1" aria-hidden="true" />
        <span className="sc-mark" data-n="2" aria-hidden="true" />
        <span className="sc-mark" data-n="3" aria-hidden="true" />
      </figure>
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
        {copy.items.map(([term, text], i) => (
          <div key={term}>
            <dt>
              <span className="sc-num">{String(i + 1).padStart(2, '0')}</span> {term}
            </dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Responsive({ copy }: { copy: Copy['responsive'] }) {
  return (
    <section className="sc-section sc-responsive" aria-labelledby="sc-responsive">
      <div className="sc-responsive-text">
        <h2 id="sc-responsive">
          <Lines text={copy.title} />
        </h2>
        <p>{copy.text}</p>
      </div>
      <figure className="sc-frame">
        <img src={`${SHOWCASE}mob-playing.webp`} width={FRAMES.narrow} height={383} alt={copy.alts.playing} loading="lazy" decoding="async" />
        <figcaption>
          <b>{copy.playing}</b>
          <span className="sc-tech">{copy.windowPlayer(375, FRAMES.narrow)}</span>
        </figcaption>
      </figure>
      <figure className="sc-frame">
        <img src={`${SHOWCASE}mob320-settings.webp`} width={FRAMES.narrowest} height={352} alt={copy.alts.sheet} loading="lazy" decoding="async" />
        <figcaption>
          <b>{copy.sheet}</b>
          <span className="sc-tech">{copy.windowPlayer(320, FRAMES.narrowest)}</span>
        </figcaption>
      </figure>
    </section>
  );
}

function States({ copy }: { copy: Copy['states'] }) {
  const [active, setActive] = useState<StateKey>('focus');
  const image = STATE_IMAGE[active];
  return (
    <div className="sc-band">
      <section className="sc-section sc-states" aria-labelledby="sc-states">
        <div className="sc-head">
          <h2 id="sc-states">
            <Lines text={copy.title} />
          </h2>
        </div>
        <div className="sc-states-body">
          <div className="sc-toggles" role="group" aria-label={copy.group}>
            {STATES.map((key, i) => (
              <button key={key} type="button" aria-pressed={active === key} onClick={() => setActive(key)}>
                <span className="sc-num">{String(i + 1).padStart(2, '0')}</span>
                {copy.labels[key]}
              </button>
            ))}
          </div>
          <figure className="sc-shot">
            <div className="sc-shot-box" style={{ aspectRatio: `${image.w} / ${image.h}` }}>
              <img
                src={`${SHOWCASE}${image.file}.webp`}
                width={image.w}
                height={image.h}
                alt={copy.alts[active]}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption aria-live="polite">
              <b>{copy.labels[active]}.</b> {copy.notes[active]}
            </figcaption>
          </figure>
        </div>
        <p className="sc-captured">{copy.captured}</p>
      </section>
    </div>
  );
}

function Use({ copy }: { copy: Copy['use'] }) {
  return (
    <section className="sc-section sc-use" aria-labelledby="sc-use">
      <SectionHead id="sc-use" title={copy.title} text={copy.text} />
      <p className="sc-links">
        <a className="sc-linkbtn" href={REPO}>
          {copy.source} <span aria-hidden="true">↗</span>
        </a>
        <a className="sc-linkbtn" href="./workbench.html">
          {copy.workbench} <span aria-hidden="true">→</span>
        </a>
      </p>
      <details className="sc-details">
        <summary>{copy.exampleTitle}</summary>
        <pre className="sc-code" tabIndex={0}>
          <code>{EXAMPLE}</code>
        </pre>
      </details>
      <details className="sc-details">
        <summary>{copy.testingTitle}</summary>
        <div className="sc-lists">
          <div>
            <h3>{copy.checkedTitle}</h3>
            <ul>
              {copy.checked.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{copy.limitsTitle}</h3>
            <ul>
              {copy.limits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
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
  // A video opened from the visitor's computer. The blob address lives only in this tab; it is released when another
  // source replaces it, when the demo is restored, and when the page closes.
  const [local, setLocal] = useState<LocalMedia | null>(null);
  const [notVideo, setNotVideo] = useState(false);
  const [failed, setFailed] = useState(false);
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
  return (
    <>
      <div className="sc-wrap">
        <div className="demo-hero">
          <Hero copy={copy} locale={locale} />
          <div className="demo-stage">
            <div className="demo-player">
              <Player local={local} onLocalError={() => setFailed(true)} onLocalReady={() => setFailed(false)} />
            </div>
            <Credit copy={copy} locale={locale} local={local} onPick={pick} onRestore={restore} notVideo={notVideo} failed={failed} />
          </div>
        </div>
        <Layers copy={copy.layers} />
        <Timeline copy={copy.timeline} />
        <Responsive copy={copy.responsive} />
      </div>
      <States copy={copy.states} />
      <div className="sc-wrap">
        <Use copy={copy.use} />
        <Footer copy={copy.footer} />
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
