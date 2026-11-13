// All page copy, English and Ukrainian. The skin's own strings live in src/video/i18n.ts; these are the showcase's.
export const STATES = ['focus', 'settings', 'captions', 'restored', 'loading', 'error'] as const;
export type StateKey = (typeof STATES)[number];

export interface Copy {
  kicker: string;
  tagline: string;
  lead: string;
  demoTag: string;
  about: string;
  hint: string;
  keysTitle: string;
  keys: [string, string][];
  local: { open: string; restore: string; note: string; notVideo: string; cannotPlay: string; region: string };
  layers: { title: string; text: string; items: [string, string][]; alt: string };
  timeline: {
    title: string;
    text: string;
    recorded: string;
    play: string;
    pause: string;
    alt: string;
    items: [string, string][];
  };
  responsive: {
    title: string;
    text: string;
    playing: string;
    sheet: string;
    windowPlayer: (window: number, player: number) => string;
    alts: { playing: string; sheet: string };
  };
  states: {
    title: string;
    group: string;
    labels: Record<StateKey, string>;
    notes: Record<StateKey, string>;
    alts: Record<StateKey, string>;
    captured: string;
  };
  use: {
    title: string;
    text: string;
    source: string;
    workbench: string;
    exampleTitle: string;
    testingTitle: string;
    checkedTitle: string;
    checked: string[];
    limitsTitle: string;
    limits: string[];
  };
  footer: {
    groups: [string, string][];
    rightsTitle: string;
    rights: string[];
    contest: string;
  };
}

export const COPY: Record<string, Copy> = {
  en: {
    kicker: 'Video.js v10 skin',
    tagline: 'Every frame.\nWithin reach.',
    lead: 'A Video.js v10 skin with a clear picture and a timeline made to be read.',
    demoTag: 'Demo footage',
    about: 'An AI-generated fashion film (Kling 2.6 Pro, made through Flora), used here as demo footage.',
    hint: 'Play. Scrub. Find your moment.',
    local: {
      open: 'Open your video',
      restore: 'Restore demo',
      note: 'Opened locally. Not uploaded.',
      notVideo: 'That file is not a video.',
      cannotPlay: 'This file could not be played in your browser. Choose another file or restore the demo.',
      region: 'Your video',
    },
    keysTitle: 'Keyboard shortcuts',
    keys: [
      ['Space, K', 'Play or pause'],
      ['← →, J L', 'Seek back or forward'],
      ['0–9, Home, End', 'Jump to a point of the video'],
      ['↑ ↓', 'Volume'],
      ['M', 'Mute'],
      ['< >', 'Speed'],
      ['C', 'Captions'],
      ['I', 'Picture-in-picture'],
      ['F', 'Fullscreen'],
    ],
    layers: {
      title: 'The picture stays clear.',
      text: 'Controls live on their own surface, not on top of the film.',
      items: [
        ['Title', 'Name, chapter and playback status.'],
        ['Picture', 'The film, with playback controls below it.'],
        ['Controls', 'One dedicated surface for playback.'],
      ],
      alt: 'The player before playback: a black title strip, the full picture, and a red control strip below it.',
    },
    timeline: {
      title: 'Don’t guess.\nFind it.',
      text: 'A readable ruler, frame previews and chapter navigation make the timeline more than a progress bar.',
      recorded: 'Recorded from the player.',
      play: 'Play recording',
      pause: 'Pause recording',
      alt: 'Recording of the pointer moving along the ruler, with a frame preview and the time following it.',
      items: [
        ['Read', 'See your position.'],
        ['Preview', 'Check the frame.'],
        ['Jump', 'Choose a chapter.'],
      ],
    },
    responsive: {
      title: 'Less space.\nSame control.',
      text: 'The ruler keeps its space. The other controls move to a second row.',
      playing: 'Two rows. One clear timeline.',
      sheet: 'Settings stay inside the player.',
      windowPlayer: (w, p) => `Window ${w} px · player ${p} px`,
      alts: {
        playing: 'Narrow player: the control panel in two rows.',
        sheet: 'Narrow player with the settings sheet open over the picture.',
      },
    },
    states: {
      title: 'Not just\nthe first frame.',
      group: 'Player states',
      labels: { focus: 'Focus', settings: 'Settings', captions: 'Captions', restored: 'Restored', loading: 'Loading', error: 'Error' },
      notes: {
        focus: 'A clear focus marker on the ruler. A contrasting ring on buttons.',
        settings: 'The menu shares the panel’s square geometry; selected is a mark, not a fill.',
        captions: 'Captions sit above the control strip, never under it.',
        restored: 'A saved position returns with a short “Resumed” note. Shown on a 36-minute copy: positions are saved for videos longer than 15 seconds.',
        loading: 'A spinner on a black plate; the status says Buffering, not just a spinner.',
        error: 'An icon and words, never color alone, with Try again as the first action.',
      },
      alts: {
        focus: 'The seek ruler with the keyboard focus frame around the pin.',
        settings: 'The settings menu open above the control strip.',
        captions: 'Captions shown on the picture above the control strip.',
        restored: 'The title strip reading Resumed 19:40 after a saved position was restored.',
        loading: 'A spinner over a black picture while the video buffers.',
        error: 'The error message with Try again and OK buttons.',
      },
      captured: 'Player captures shown in English.',
    },
    use: {
      title: 'Your film.\nYour viewport.',
      text: 'The skin is a React component on Video.js v10. Copy the src/ folder into a React project, wrap your media in it, and give each video a stable resumeKey.',
      source: 'View source',
      workbench: 'Open workbench',
      exampleTitle: 'Integration example',
      testingTitle: 'Testing & limitations',
      checkedTitle: 'Checked',
      checked: [
        'Chrome on Windows, automated: window widths 320, 375, 720, 768 and 1440 px (720 px checks the narrow layout; it is not browser zoom), with no horizontal scroll and no overlapping controls.',
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
        'Browser zoom at 200% was not tested.',
        'The interface strings exist in English and Ukrainian only.',
      ],
    },
    footer: {
      groups: [
        ['Design & code', 'Natalia Trusova · Apache 2.0'],
        ['Typography', 'Onest + IBM Plex Mono · OFL'],
        ['Demo film', 'Scarlet Walk · AI-generated with Kling 2.6 Pro via Flora'],
      ],
      rightsTitle: 'Demo footage & rights',
      rights: [
        'The film is AI-generated, made for this page with Kling 2.6 Pro through Flora. The terms for reusing it depend on the generator’s terms; they have not been confirmed here, so check them before reusing the film.',
        'It is shown only to demonstrate the skin. This is a demonstration, not a client project.',
        'Player framework: Video.js v10, used under its own license.',
      ],
      contest: 'Made for the Video.js Skins Design Challenge. Not endorsed by Video.js.',
    },
  },
  uk: {
    kicker: 'Скін для Video.js v10',
    tagline: 'Кожен кадр.\nПід контролем.',
    lead: 'Скін для Video.js v10 із чистим кадром і шкалою часу, яку легко читати.',
    demoTag: 'Демо-відео',
    about: 'Модний фільм, згенерований ШІ (Kling 2.6 Pro, через Flora), використаний тут як демонстраційне відео.',
    hint: 'Запустіть. Перемотайте. Знайдіть свою мить.',
    local: {
      open: 'Відкрити своє відео',
      restore: 'Повернути демо',
      note: 'Файл відкривається лише у вашому браузері. На сервер не надсилається.',
      notVideo: 'Цей файл не є відео.',
      cannotPlay: 'Цей файл не вдалося відтворити у вашому браузері. Оберіть інший файл або поверніть демо.',
      region: 'Ваше відео',
    },
    keysTitle: 'Клавіатурні скорочення',
    keys: [
      ['Пробіл, K', 'Відтворення або пауза'],
      ['← →, J L', 'Перемотка назад або вперед'],
      ['0–9, Home, End', 'Перехід до місця у відео'],
      ['↑ ↓', 'Гучність'],
      ['M', 'Без звуку'],
      ['< >', 'Швидкість'],
      ['C', 'Субтитри'],
      ['I', 'Картинка в картинці'],
      ['F', 'Повний екран'],
    ],
    layers: {
      title: 'Кадр лишається чистим.',
      text: 'Керування живе на власній поверхні, а не лежить поверх фільму.',
      items: [
        ['Назва', 'Ім’я, розділ і стан відтворення.'],
        ['Зображення', 'Фільм, а керування відтворенням — під ним.'],
        ['Керування', 'Окрема поверхня для відтворення.'],
      ],
      alt: 'Плеєр до відтворення: чорна смуга назви, повне зображення і червона смуга керування під ним.',
    },
    timeline: {
      title: 'Не навмання.\nДо потрібної миті.',
      text: 'Зрозуміла лінійка, кадри попереднього перегляду й розділи роблять шкалу чимось більшим за смугу прогресу.',
      recorded: 'Запис із плеєра.',
      play: 'Відтворити запис',
      pause: 'Пауза',
      alt: 'Запис руху вказівника вздовж лінійки: з’являється кадр попереднього перегляду і час.',
      items: [
        ['Читання', 'Бачите свою позицію.'],
        ['Перегляд', 'Перевірте кадр.'],
        ['Перехід', 'Оберіть розділ.'],
      ],
    },
    responsive: {
      title: 'Менше місця.\nТе саме керування.',
      text: 'Лінійка зберігає своє місце. Решта кнопок переходить до другого рядка.',
      playing: 'Два рядки. Одна зрозуміла шкала.',
      sheet: 'Налаштування лишаються всередині плеєра.',
      windowPlayer: (w, p) => `Вікно ${w} px · плеєр ${p} px`,
      alts: {
        playing: 'Вузький плеєр: панель керування у два рядки.',
        sheet: 'Вузький плеєр із відкритою шторкою налаштувань над зображенням.',
      },
    },
    states: {
      title: 'Не лише\nперший кадр.',
      group: 'Стани плеєра',
      labels: { focus: 'Фокус', settings: 'Налаштування', captions: 'Субтитри', restored: 'Відновлено', loading: 'Завантаження', error: 'Помилка' },
      notes: {
        focus: 'Чіткий маркер фокуса на лінійці. Контрастне кільце на кнопках.',
        settings: 'Меню має ту саму квадратну геометрію, що й панель; вибране позначене знаком, а не заливкою.',
        captions: 'Субтитри розташовані над смугою керування, а не під нею.',
        restored: 'Збережена позиція повертається з коротким написом «Продовжено». Показано на 36-хвилинній копії: позиції зберігаються для відео довших за 15 секунд.',
        loading: 'Індикатор на чорній підкладці, а статус підписує стан словом.',
        error: 'Значок і слово, а не самий лише колір; першою дією стоїть «Спробувати ще раз».',
      },
      alts: {
        focus: 'Лінійка перемотки з рамкою клавіатурного фокуса навколо вказівника.',
        settings: 'Меню налаштувань, відкрите над смугою керування.',
        captions: 'Субтитри на зображенні над смугою керування.',
        restored: 'Смуга назви з написом Resumed 19:40 після відновлення збереженої позиції.',
        loading: 'Індикатор на чорному зображенні під час буферизації відео.',
        error: 'Повідомлення про помилку з кнопками Try again і OK.',
      },
      captured: 'Кадри плеєра показано англійською.',
    },
    use: {
      title: 'Ваше відео.\nВаш плеєр.',
      text: 'Скін — це компонент React на Video.js v10. Скопіюйте папку src/ у React-проєкт, обгорніть ним своє медіа й дайте кожному відео стійкий resumeKey.',
      source: 'Переглянути код',
      workbench: 'Відкрити робочий стенд',
      exampleTitle: 'Приклад підключення',
      testingTitle: 'Перевірки та обмеження',
      checkedTitle: 'Перевірено',
      checked: [
        'Chrome на Windows, автоматично: вікна 320, 375, 720, 768 і 1440 px (720 px перевіряє вузьку розкладку, це не масштаб браузера), без горизонтальної прокрутки та накладання елементів.',
        'Клавіатура: усі елементи досяжні, фокус видно, меню відкривається, повертається назад і закривається клавішею Escape.',
        'Меню на дотик в емуляції Chrome: відкриття не позначає рядок вибраним.',
        'Перевірка типів і збірка проходять.',
      ],
      limitsTitle: 'Відомі обмеження',
      limits: [
        'Не перевірено в Safari і Firefox.',
        'Не перевірено на справжньому телефоні; дотик лише емульовано.',
        'Не перевірено зі скрінрідером.',
        'Режим зменшення руху не перевірявся в реальній системі.',
        'Масштаб браузера 200% не перевірявся.',
        'Інтерфейс перекладено лише англійською та українською.',
      ],
    },
    footer: {
      groups: [
        ['Дизайн і код', 'Наталя Трусова · Apache 2.0'],
        ['Типографіка', 'Onest + IBM Plex Mono · OFL'],
        ['Демо-фільм', 'Scarlet Walk · згенеровано ШІ в Kling 2.6 Pro через Flora'],
      ],
      rightsTitle: 'Демо-відео та права',
      rights: [
        'Фільм згенеровано ШІ для цієї сторінки в Kling 2.6 Pro через Flora. Умови його повторного використання залежать від умов генератора; тут їх не підтверджено, тож перевірте їх, перш ніж використовувати фільм деінде.',
        'Тут він лише демонструє скін. Це демонстрація, а не клієнтський проєкт.',
        'Фреймворк плеєра: Video.js v10 за його власною ліцензією.',
      ],
      contest: 'Створено для Video.js Skins Design Challenge. Не є офіційним продуктом Video.js.',
    },
  },
};

export const EXAMPLE = `import '@/skin.css';
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
}`;
