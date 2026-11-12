import { I18nProvider, useLocale } from '@videojs/react/i18n';
import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '@/skin.css';
import './demo.css';
import './showcase.css';
import { MATERIAL, Player, TITLE } from '../frame/player';

// The showcase page. One real player at the top; everything below is captured from this same build (images and one
// short clip, labeled as recordings). The workbench (`index.html`) stays for testing.
// The language comes from the address (`?lang=uk`) and defaults to English; the skin and the page both follow it.
const params = new URLSearchParams(location.search);
const LOCALE = (params.get('lang') ?? 'en').trim() || 'en';

const SHOWCASE = './showcase/';
const REPO = 'https://github.com/trusovanaty/signal-viewport';
/** Measured player widths of the captured frames (a 375 px window holds a 343 px player, a 320 px window a 288 px one). */
const FRAMES = { wide: 960, narrow: 343, narrowest: 288 };

const STATES = ['focus', 'settings', 'captions', 'restored', 'loading', 'error'] as const;
type StateKey = (typeof STATES)[number];
const STATE_IMAGE: Record<StateKey, string> = {
  focus: 'g-focus',
  settings: 'g-settings',
  captions: 'g-captions',
  restored: 'g-restored',
  loading: 'g-loading',
  error: 'g-error',
};

interface Copy {
  kicker: string;
  tagline: string;
  lead: string;
  demoTag: string;
  about: string;
  hint: string;
  keys: string[];
  layers: { title: string; text: string; items: [string, string, string]; alt: string };
  timeline: {
    title: string;
    text: string;
    recorded: string;
    play: string;
    pause: string;
    alt: string;
    items: [[string, string], [string, string], [string, string]];
  };
  responsive: {
    title: string;
    text: string;
    wide: string;
    narrow: string;
    sheet: string;
    windowPlayer: (window: number, player: number) => string;
    alts: { wide: string; narrow: string; sheet: string };
  };
  states: {
    title: string;
    group: string;
    labels: Record<StateKey, string>;
    notes: Record<StateKey, string>;
    alts: Record<StateKey, string>;
    captured: string;
    checkedTitle: string;
    checked: string[];
    limitsTitle: string;
    limits: string[];
  };
  use: {
    title: string;
    text: string;
    exampleTitle: string;
    workbench: string;
    source: string;
    creditsTitle: string;
    credits: string[];
  };
}

const COPY: Record<string, Copy> = {
  en: {
    kicker: 'Video.js v10 skin',
    tagline: 'A clear view.\nA precise timeline.',
    lead: 'An expressive video skin with controls outside the picture and a timeline made to be read.',
    demoTag: 'Demo footage',
    about: 'Sample stream from Mux, used here as demo footage.',
    hint: 'Play. Scrub. Open settings. Try the keyboard.',
    keys: ['Space play', 'M mute', 'Arrows seek', 'Up Down volume', '< > speed', 'F fullscreen'],
    layers: {
      title: 'The picture stays clear.',
      text: 'Controls live on their own surface, not on top of the film.',
      items: ['Title and chapter.', 'Uncovered picture.', 'Dedicated control strip.'],
      alt: 'The player before playback: a black title strip, the full picture, and a red control strip below it.',
    },
    timeline: {
      title: 'Find the moment.',
      text: 'A readable ruler, frame previews and chapter navigation make the timeline more than a progress bar.',
      recorded: 'Recorded from the player.',
      play: 'Play recording',
      pause: 'Pause recording',
      alt: 'Recording of the pointer moving along the ruler, with a frame preview and the time following it.',
      items: [
        ['Read', 'Understand your position.'],
        ['Preview', 'See before you seek.'],
        ['Jump', 'Move between chapters.'],
      ],
    },
    responsive: {
      title: 'Rearranged. Not squeezed.',
      text: 'The timeline keeps its space. Controls move when the player gets smaller.',
      wide: 'Wide: one row, everything beside the ruler.',
      narrow: 'Narrow: two rows. The ruler gets the full width.',
      sheet: 'Settings open as a sheet inside the player; the speed value is hidden.',
      windowPlayer: (w, p) => `${w} px window, ${p} px player.`,
      alts: {
        wide: 'Wide player: title strip, picture, and a single control row.',
        narrow: 'Narrow player: the control panel in two rows.',
        sheet: 'Narrow player with the settings sheet open over the picture.',
      },
    },
    states: {
      title: 'Every state has a place.',
      group: 'Player states',
      labels: { focus: 'Focus', settings: 'Settings', captions: 'Captions', restored: 'Restored', loading: 'Loading', error: 'Error' },
      notes: {
        focus: 'A double ring, ink inside and white outside, stays readable on red, black and white.',
        settings: 'The menu shares the panel’s square geometry; selected is a mark, not a fill.',
        captions: 'Captions sit above the control strip, never under it.',
        restored: 'A saved position returns with a short “Resumed” note, then the note goes away.',
        loading: 'A spinner on a black plate; the status says Buffering, not just a spinner.',
        error: 'An icon and words, never color alone, with Try again as the first action.',
      },
      alts: {
        focus: 'The seek ruler with the keyboard focus ring.',
        settings: 'The settings menu open above the control strip.',
        captions: 'Captions shown on the picture above the control strip.',
        restored: 'The title strip reading Resumed 0:47 after a saved position was restored.',
        loading: 'A spinner over a black picture while the stream buffers.',
        error: 'The error message with Try again and Close buttons.',
      },
      captured: 'Captured from this build, English interface.',
      checkedTitle: 'Checked',
      checked: [
        'Chrome on Windows, automated: window widths 320, 375, 768 and 1440 px, no horizontal scroll, no overlapping controls.',
        'Keyboard: every control reachable, focus ring visible, menus open, go back and close with Escape.',
        'Touch menu in Chrome’s touch emulation: opening it does not mark a row as selected.',
        'Type check and production build pass.',
      ],
      limitsTitle: 'Known limitations',
      limits: [
        'Not tested in Safari or Firefox.',
        'Not tested on a real phone; touch was only emulated.',
        'Not tested with a screen reader.',
        'The reduced-motion setting was not tested on a real system.',
        'The interface strings exist in English and Ukrainian only.',
      ],
    },
    use: {
      title: 'Built on Video.js v10.\nMade to leave this page.',
      text: 'The skin is a React component. Wrap your media in it inside a Video.js player; the page you are reading is only a wrapper around the same example.',
      exampleTitle: 'The setup used on this page',
      workbench: 'Open workbench',
      source: 'View source',
      creditsTitle: 'Credits and licenses',
      credits: [
        'Skin design and code: Natalia Trusova, Apache License 2.0.',
        'Player framework: Video.js v10, used under its own license.',
        'Type: Onest and IBM Plex Mono, both SIL Open Font License 1.1.',
        'Demo footage: a Mux sample stream (NASA’s Cosmic Dawn trailer). Rights stay with their owners; it is shown only to demonstrate the skin.',
        'Made for the Video.js Skins Design Challenge. Not endorsed by Video.js.',
      ],
    },
  },
  uk: {
    kicker: 'Скін для Video.js v10',
    tagline: 'Чітке зображення.\nТочна шкала часу.',
    lead: 'Виразний скін для відео: керування поза кадром і шкала часу, яку легко читати.',
    demoTag: 'Демо-відео',
    about: 'Зразок потоку від Mux, використаний тут як демонстраційне відео.',
    hint: 'Запустіть. Перемотайте. Відкрийте налаштування. Спробуйте клавіатуру.',
    keys: ['Пробіл — відтворення', 'M — звук', 'Стрілки — перемотка', 'Вгору/вниз — гучність', '< > — швидкість', 'F — повний екран'],
    layers: {
      title: 'Кадр лишається чистим.',
      text: 'Керування має власну поверхню, а не лежить поверх фільму.',
      items: ['Назва і розділ.', 'Нічим не закрите зображення.', 'Окрема смуга керування.'],
      alt: 'Плеєр до відтворення: чорна смуга назви, повне зображення і червона смуга керування під ним.',
    },
    timeline: {
      title: 'Знайдіть потрібну мить.',
      text: 'Читабельна лінійка, попередній перегляд кадрів і розділи роблять шкалу чимось більшим за смугу прогресу.',
      recorded: 'Запис із плеєра.',
      play: 'Відтворити запис',
      pause: 'Пауза',
      alt: 'Запис руху вказівника вздовж лінійки: з’являється кадр попереднього перегляду і час.',
      items: [
        ['Читати', 'Бачити, де ви є.'],
        ['Дивитися', 'Побачити кадр до перемотки.'],
        ['Переходити', 'Стрибати між розділами.'],
      ],
    },
    responsive: {
      title: 'Перебудова, а не стиснення.',
      text: 'Шкала зберігає своє місце. Кнопки переходять, коли плеєр стає меншим.',
      wide: 'Широкий: один ряд, усе поруч із лінійкою.',
      narrow: 'Вузький: два ряди. Лінійка отримує всю ширину.',
      sheet: 'Налаштування відкриваються шторкою всередині плеєра; значення швидкості приховано.',
      windowPlayer: (w, p) => `Вікно ${w} px, плеєр ${p} px.`,
      alts: {
        wide: 'Широкий плеєр: смуга назви, зображення і один ряд кнопок.',
        narrow: 'Вузький плеєр: панель керування у два ряди.',
        sheet: 'Вузький плеєр із відкритою шторкою налаштувань над зображенням.',
      },
    },
    states: {
      title: 'Кожен стан має своє місце.',
      group: 'Стани плеєра',
      labels: { focus: 'Фокус', settings: 'Налаштування', captions: 'Субтитри', restored: 'Відновлено', loading: 'Завантаження', error: 'Помилка' },
      notes: {
        focus: 'Подвійне кільце, чорне всередині й біле ззовні, читається на червоному, чорному і білому.',
        settings: 'Меню має ту саму квадратну геометрію, що й панель; вибране позначене знаком, а не заливкою.',
        captions: 'Субтитри розташовані над смугою керування, а не під нею.',
        restored: 'Збережена позиція повертається з коротким написом «Продовжено», який потім зникає.',
        loading: 'Індикатор на чорній підкладці, а статус каже «Буферизація», а не лише крутить колесо.',
        error: 'Значок і слова, ніколи не лише колір; першою дією іде «Спробувати ще раз».',
      },
      alts: {
        focus: 'Лінійка перемотки з кільцем клавіатурного фокуса.',
        settings: 'Меню налаштувань, відкрите над смугою керування.',
        captions: 'Субтитри на зображенні над смугою керування.',
        restored: 'Смуга назви з написом Resumed 0:47 після відновлення збереженої позиції.',
        loading: 'Індикатор на чорному зображенні під час буферизації потоку.',
        error: 'Повідомлення про помилку з кнопками Try again і Close.',
      },
      captured: 'Знято з цієї збірки, англомовний інтерфейс.',
      checkedTitle: 'Перевірено',
      checked: [
        'Chrome на Windows, автоматично: вікна 320, 375, 768 і 1440 px, без горизонтальної прокрутки та накладання елементів.',
        'Клавіатура: усі елементи досяжні, фокус видно, меню відкривається, повертається назад і закривається клавішею Escape.',
        'Дотикове меню в емуляції дотику Chrome: відкриття не позначає рядок як вибраний.',
        'Перевірка типів і збірка проходять.',
      ],
      limitsTitle: 'Відомі обмеження',
      limits: [
        'Не перевірено в Safari і Firefox.',
        'Не перевірено на справжньому телефоні; дотик лише емульовано.',
        'Не перевірено зі скрінрідером.',
        'Налаштування зменшення руху не перевірялося на реальній системі.',
        'Рядки інтерфейсу є лише англійською та українською.',
      ],
    },
    use: {
      title: 'Створено на Video.js v10.\nПризначено жити поза цією сторінкою.',
      text: 'Скін — це компонент React. Обгорніть ним своє медіа всередині плеєра Video.js; ця сторінка — лише обгортка навколо того самого прикладу.',
      exampleTitle: 'Налаштування, що використане на цій сторінці',
      workbench: 'Відкрити робочий стенд',
      source: 'Переглянути код',
      creditsTitle: 'Авторство та ліцензії',
      credits: [
        'Дизайн і код скіна: Наталя Трусова, Apache License 2.0.',
        'Фреймворк плеєра: Video.js v10 за його власною ліцензією.',
        'Шрифти: Onest та IBM Plex Mono, обидва за SIL Open Font License 1.1.',
        'Демо-відео: зразок потоку Mux (трейлер NASA «Cosmic Dawn»). Права лишаються за власниками; відео показано лише для демонстрації скіна.',
        'Створено для Video.js Skins Design Challenge. Не схвалено Video.js.',
      ],
    },
  },
};

const EXAMPLE = `<VideoPlayer title="Your film" poster="poster.webp">
  <VideoSkin>
    <MuxVideo src="https://…/stream.m3u8" playsInline crossOrigin="">
      <track kind="chapters" srcLang="en" src="chapters.vtt" default />
    </MuxVideo>
  </VideoSkin>
</VideoPlayer>`;

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

function Hero({ copy }: { copy: Copy }) {
  return (
    <header className="demo-head">
      <p className="demo-label">
        <span>Signal Viewport</span>
        <span>{copy.kicker}</span>
      </p>
      <h1 className="demo-tagline">
        <Lines text={copy.tagline} />
      </h1>
      <p className="demo-lead">{copy.lead}</p>
    </header>
  );
}

function Credit({ copy, locale }: { copy: Copy; locale: string }) {
  const about = MATERIAL.about ? (locale.startsWith('uk') && MATERIAL.isDemo ? copy.about : MATERIAL.about) : null;
  return (
    <div className="demo-credit">
      <strong>{TITLE}</strong>
      {MATERIAL.isDemo ? <span className="demo-tag">{copy.demoTag}</span> : null}
      {MATERIAL.author ? <span>{MATERIAL.author}</span> : null}
      {about ? <p>{about}</p> : null}
      <p className="demo-hint">{copy.hint}</p>
      <ul className="demo-keys">
        {copy.keys.map((key) => (
          <li key={key}>{key}</li>
        ))}
      </ul>
    </div>
  );
}

function SectionHead({ id, title, text }: { id: string; title: string; text: string }) {
  return (
    <div className="sc-head">
      <h2 id={id}>
        <Lines text={title} />
      </h2>
      <p>{text}</p>
    </div>
  );
}

function Layers({ copy }: { copy: Copy['layers'] }) {
  return (
    <section className="sc-section" aria-labelledby="sc-layers">
      <SectionHead id="sc-layers" title={copy.title} text={copy.text} />
      <figure className="sc-layers">
        <img src={`${SHOWCASE}desk-start.webp`} width={960} height={668} alt={copy.alt} loading="lazy" decoding="async" />
        <ol className="sc-rail">
          {copy.items.map((item, i) => (
            <li key={item} data-n={i + 1}>
              {item}
            </li>
          ))}
        </ol>
      </figure>
    </section>
  );
}

function Timeline({ copy }: { copy: Copy['timeline'] }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => undefined);
    else el.pause();
  };
  return (
    <section className="sc-section" aria-labelledby="sc-timeline">
      <SectionHead id="sc-timeline" title={copy.title} text={copy.text} />
      <figure className="sc-clip">
        {/* A recording, not a control: silent, no autoplay, no controls of its own drawn over the interface.
            The button below it starts and pauses it. */}
        <video
          ref={video}
          src={`${SHOWCASE}timeline.mp4`}
          poster={`${SHOWCASE}seek-b.webp`}
          width={960}
          height={668}
          muted
          playsInline
          preload="none"
          aria-label={copy.alt}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
        <figcaption className="sc-clip-bar">
          <button type="button" className="sc-btn" onClick={toggle}>
            {playing ? copy.pause : copy.play}
          </button>
          <span>{copy.recorded}</span>
        </figcaption>
      </figure>
      <dl className="sc-trio">
        {copy.items.map(([term, text]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Responsive({ copy }: { copy: Copy['responsive'] }) {
  const items = [
    { src: 'mob-playing', w: 343, h: 383, text: copy.narrow, alt: copy.alts.narrow, label: copy.windowPlayer(375, FRAMES.narrow) },
    { src: 'mob320-settings', w: 288, h: 352, text: copy.sheet, alt: copy.alts.sheet, label: copy.windowPlayer(320, FRAMES.narrowest) },
  ];
  return (
    <section className="sc-section" aria-labelledby="sc-responsive">
      <SectionHead id="sc-responsive" title={copy.title} text={copy.text} />
      <figure className="sc-frame">
        <img src={`${SHOWCASE}desk-playing.webp`} width={960} height={668} alt={copy.alts.wide} loading="lazy" decoding="async" />
        <figcaption>
          <b>{copy.windowPlayer(1440, FRAMES.wide)}</b> {copy.wide}
        </figcaption>
      </figure>
      <div className="sc-narrow">
        {items.map((item) => (
          <figure key={item.src} className="sc-frame">
            <img src={`${SHOWCASE}${item.src}.webp`} width={item.w} height={item.h} alt={item.alt} loading="lazy" decoding="async" />
            <figcaption>
              <b>{item.label}</b> {item.text}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function States({ copy }: { copy: Copy['states'] }) {
  const [active, setActive] = useState<StateKey>('focus');
  return (
    <section className="sc-section" aria-labelledby="sc-states">
      <div className="sc-head">
        <h2 id="sc-states">{copy.title}</h2>
      </div>
      <div className="sc-toggles" role="group" aria-label={copy.group}>
        {STATES.map((key) => (
          <button key={key} type="button" aria-pressed={active === key} onClick={() => setActive(key)}>
            {copy.labels[key]}
          </button>
        ))}
      </div>
      <figure className="sc-frame">
        <img
          src={`${SHOWCASE}${STATE_IMAGE[active]}.webp`}
          width={960}
          height={668}
          alt={copy.alts[active]}
          loading="lazy"
          decoding="async"
        />
        <figcaption aria-live="polite">
          <b>{copy.labels[active]}.</b> {copy.notes[active]} <span className="sc-muted">{copy.captured}</span>
        </figcaption>
      </figure>
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
    </section>
  );
}

function Use({ copy }: { copy: Copy['use'] }) {
  return (
    <section className="sc-section" aria-labelledby="sc-use">
      <SectionHead id="sc-use" title={copy.title} text={copy.text} />
      <div className="sc-lists">
        <div>
          <h3>{copy.exampleTitle}</h3>
          <pre className="sc-code" tabIndex={0}>
            <code>{EXAMPLE}</code>
          </pre>
          <p>
            <a className="sc-link" href="./index.html">
              {copy.workbench}
            </a>{' '}
            <a className="sc-link" href={REPO}>
              {copy.source}
            </a>
          </p>
        </div>
        <div>
          <h3>{copy.creditsTitle}</h3>
          <ul>
            {copy.credits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="sc-licenses">
            <a className="sc-link" href={`${REPO}/blob/main/LICENSE`}>
              Apache 2.0
            </a>
            <a className="sc-link" href="./font-licenses/OFL-Onest.txt">
              OFL — Onest
            </a>{' '}
            <a className="sc-link" href="./font-licenses/OFL-IBMPlexMono.txt">
              OFL — IBM Plex Mono
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

function Demo() {
  const locale = useLocale();
  const copy = COPY[locale] ?? COPY[locale.split('-')[0] ?? 'en'] ?? COPY.en!;
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return (
    <div className="demo-wrap">
      <Hero copy={copy} />
      <div className="demo-player">
        <Player />
      </div>
      <Credit copy={copy} locale={locale} />
      <Layers copy={copy.layers} />
      <Timeline copy={copy.timeline} />
      <Responsive copy={copy.responsive} />
      <States copy={copy.states} />
      <Use copy={copy.use} />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider locale={LOCALE}>
      <Demo />
    </I18nProvider>
  </StrictMode>
);
