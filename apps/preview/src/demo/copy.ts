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
  view: { group: string; desktop: string; mobile: string };
  theme: { group: string; red: string; mono: string; note: string };
  source: string;
  keysTitle: string;
  keys: [string, string][];
  local: { prompt: string; open: string; restore: string; hint: string; note: string; notVideo: string; cannotPlay: string; region: string };
  layers: { title: string; text: string; items: [string, string][]; alt: string; caption: string };
  timeline: {
    title: string;
    text: string;
    recorded: string;
    play: string;
    pause: string;
    alt: string;
    gotoAlt: string;
    goto: string;
    feature: { label: string; heading: string };
    items: [string, string][];
  };
  responsive: {
    title: string;
    text: string;
    labels: [string, string];
    playing: string;
    sheet: string;
    windowPlayer: (window: number, player: number) => string;
    alts: { playing: string; sheet: string };
  };
  states: {
    title: string;
    text: string;
    group: string;
    hint: string;
    labels: Record<StateKey, string>;
    notes: Record<StateKey, string>;
    alts: Record<StateKey, string>;
  };
  formats: { title: string; text: string; items: [string, string][] };
  prefs: { title: string; text: string; items: [string, string][] };
  keyboard: {
    title: string;
    text: string;
    keysTitle: string;
    keysText: string;
    or: string;
    focus: { heading: string; title: string; text: string; marker: string; button: string; markerAlt: string; buttonAlt: string };
  };
  use: {
    title: string;
    text: string;
    source: string;
    workbench: string;
    exampleTitle: string;
    testingTitle: string;
    testingText: string;
    languagesLine: string;
    detailsTitle: string;
    checkedTitle: string;
    checked: string[];
    notTestedTitle: string;
    notTested: string[];
    notesTitle: string;
    notes: string[];
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
    about: 'AI-generated film and music, by the author.',
    hint: 'Play. Scrub. Find your moment.',
    local: {
      prompt: 'Try it with your own video.',
      hint: 'Opens locally in your browser. Nothing is uploaded.',
      open: 'Open your video',
      restore: 'Restore demo',
      note: 'Opened locally in your browser. Nothing is uploaded.',
      notVideo: 'That file is not a video.',
      cannotPlay: 'This file could not be played in your browser. Choose another file or restore the demo.',
      region: 'Your video',
    },
    view: { group: 'Player width', desktop: 'Desktop', mobile: 'Mobile' },
    theme: {
      group: 'Player colour',
      red: 'Red',
      mono: 'Mono',
      note: 'Red is the signature look. Mono is neutral and fits most sites.',
    },
    source: 'Source',
    keysTitle: 'Keyboard shortcuts',
    keys: [
      ['Space, K', 'Play or pause'],
      ['← →, J L', 'Seek 10 s back or forward'],
      ['0–9, Home, End', 'Jump to a point of the video'],
      ['↑ ↓', 'Volume'],
      ['M', 'Mute'],
      ['< >', 'Speed'],
      ['C', 'Captions'],
      ['I', 'Picture-in-picture'],
      ['F', 'Fullscreen'],
    ],
    layers: {
      title: 'Full frame.',
      text: 'Controls live on their own surface, not on top of the film.',
      items: [
        ['Title', 'Film title, chapter and playback status.'],
        ['Picture', 'The control strip stays outside the film.'],
        ['Controls', 'A dedicated surface for playback and navigation.'],
      ],
      alt: 'Interface anatomy: three layers of the player pulled apart a little. The black title strip, the film picture, and the red control strip.',
      caption: 'Interface anatomy. Layers separated for clarity.',
    },
    timeline: {
      title: 'Time\ncontrol.',
      text: 'A readable ruler, frame previews and chapter navigation make the timeline more than a progress bar.',
      recorded: 'Recorded from the player.',
      play: 'Play recording',
      pause: 'Pause recording',
      alt: 'Recording of the pointer moving along the ruler, with a frame preview and the time following it.',
      gotoAlt: 'The control panel with the time field open and 0:07 typed in it.',
      goto: 'Click the time, type m:ss and press Enter: the player goes to that exact moment.',
      feature: { label: 'Feature', heading: 'Type the time' },
      items: [
        ['Read', 'See your position.'],
        ['Preview', 'Check the frame.'],
        ['Jump', 'Choose a chapter.'],
      ],
    },
    responsive: {
      title: 'Mobile\nadaptation',
      text: 'The same player in a narrow window: the ruler keeps its place, the other buttons move to a second row, the settings open inside the player.',
      labels: ['01 / PLAYBACK', '02 / SETTINGS'],
      playing: 'Two rows. One clear timeline.',
      sheet: 'Settings stay inside the player.',
      windowPlayer: (w, p) => `Window ${w} px · player ${p} px`,
      alts: {
        playing: 'Narrow player: the control panel in two rows.',
        sheet: 'Narrow player with the settings sheet open over the picture.',
      },
    },
    states: {
      title: 'Player states.',
      text: 'Focus, menu, captions, resume, loading and error: not only the calm first frame.',
      group: 'Player states',
      hint: 'Pick a state to see it on the player.',
      labels: { focus: 'Focus', settings: 'Settings', captions: 'Captions', restored: 'Restored', loading: 'Loading', error: 'Error' },
      notes: {
        focus: 'A clear focus marker on the ruler. A contrasting ring on buttons.',
        settings: 'Speed, Quality, Captions, Chapters and Colour in one menu, with the panel’s square geometry. The selected item is marked with a sign, not a fill. Colour switches the whole skin between Red and Mono.',
        captions: 'Captions sit above the control strip, never under it.',
        restored: 'A saved position returns with a short “Resumed” note. Positions are saved for videos longer than 15 seconds, so the 30-second demo film shows it.',
        loading: 'A piece of the ruler on a black plate: the pin steps along the ticks. The status says Buffering, not just an icon.',
        error: 'An icon and words, never color alone, with Try again as the first action.',
      },
      alts: {
        focus: 'The seek ruler with the keyboard focus frame around the pin.',
        settings: 'The settings menu open above the control strip.',
        captions: 'Captions shown on the picture above the control strip.',
        restored: 'The title strip reading Resumed 0:15 after a saved position was restored.',
        loading: 'A small ruler with a pin over a black picture while the video buffers.',
        error: 'The error message with Try again and OK buttons.',
      },
    },
    formats: {
      title: 'Any format',
      text: 'The same skin and the same controls for wide, square and vertical video.',
      items: [
        ['16:9', 'Wide'],
        ['1:1', 'Square'],
        ['9:16', 'Vertical'],
      ],
    },
    prefs: {
      title: 'Preferences.',
      text: 'The player remembers you, speaks your language and adapts to how you use it.',
      items: [
        ['Memory', 'Remembers speed, sound, caption language and the position of each video. One command resets it all.'],
        ['Languages', 'The skin speaks English and Ukrainian; the rest follows the Video.js translations.'],
        ['Accessibility', 'Styles for reduced motion and high contrast, and state changes announced to screen readers.'],
        ['Touch', 'Double-tap the left or right side to seek, the centre to go fullscreen.'],
      ],
    },
    keyboard: {
      title: 'Navigation.',
      text: 'Reach any moment: with the keys and with the focus.',
      keysTitle: 'Shortcuts',
      keysText: 'Every control works from the keyboard while the player is in focus.',
      or: 'or',
      focus: {
        heading: 'Focus',
        title: 'How to see keyboard focus',
        text: 'Click the player, then press Tab to move from control to control. A frame always shows where you are. It appears for the keyboard, not for the mouse.',
        marker: 'On the ruler: a black frame around the marker. The arrow keys move the marker.',
        button: 'On a button: a white ring with a black edge. Space or Enter presses it.',
        markerAlt: 'The ruler with a black keyboard focus frame around the marker.',
        buttonAlt: 'The settings button with a white keyboard focus ring and a black edge.',
      },
    },
    use: {
      title: 'Your film.\nYour viewport.',
      text: 'The skin is a React component on Video.js v10. Copy the src/ folder into a React project, wrap your media in it, and give each video a stable resumeKey.',
      source: 'View source',
      workbench: 'Open workbench',
      exampleTitle: 'Integration example',
      testingTitle: 'Testing & compatibility',
      testingText: 'Tested in Chrome on Windows. Safari and assistive technologies have not yet been tested.',
      languagesLine: 'Interface languages: English / Ukrainian.',
      detailsTitle: 'Testing details',
      checkedTitle: 'Checked',
      checked: [],
      notTestedTitle: 'Not tested',
      notTested: [
        'Safari.',
        'A real screen reader (NVDA, JAWS, VoiceOver, TalkBack).',
        'Browser zoom at 200%, and displays with fractional scaling (125%, 150%).',
      ],
      notesTitle: 'How',
      notes: ['The checks are automatic, in headless Chrome on Windows, with no manual session on a device.'],
    },
    footer: {
      groups: [
        ['Design & code', 'Natalia Trusova · Apache 2.0'],
        ['Typography', 'Onest + IBM Plex Mono · OFL'],
        ['Demo film', 'Freefall Bloom · AI-generated film and music, by the author'],
      ],
      rightsTitle: 'Demo footage & rights',
      rights: [
        'The film is AI-generated and made by the author for this page, and the music is the author’s too. The terms for reusing it depend on the generator’s terms; they have not been confirmed here, so check them before reusing the film.',
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
    about: 'Фільм згенеровано ШІ, музика авторки.',
    hint: 'Запустіть. Перемотайте. Знайдіть свою мить.',
    local: {
      prompt: 'Спробуйте зі своїм відео.',
      hint: 'Відкривається локально. Нічого не надсилається.',
      open: 'Відкрити своє відео',
      restore: 'Повернути демо',
      note: 'Файл відкривається лише у вашому браузері. На сервер не надсилається.',
      notVideo: 'Цей файл не є відео.',
      cannotPlay: 'Цей файл не вдалося відтворити у вашому браузері. Оберіть інший файл або поверніть демо.',
      region: 'Ваше відео',
    },
    view: { group: 'Ширина плеєра', desktop: 'Десктоп', mobile: 'Мобільний' },
    theme: {
      group: 'Колір плеєра',
      red: 'Червоний',
      mono: 'Моно',
      note: 'Червоний — фірмовий вигляд. Моно нейтральніший і пасує більшості сайтів.',
    },
    source: 'Джерело',
    keysTitle: 'Клавіатурні скорочення',
    keys: [
      ['Пробіл, K', 'Відтворення або пауза'],
      ['← →, J L', 'Перемотка на 10 с назад або вперед'],
      ['0–9, Home, End', 'Перехід до місця у відео'],
      ['↑ ↓', 'Гучність'],
      ['M', 'Без звуку'],
      ['< >', 'Швидкість'],
      ['C', 'Субтитри'],
      ['I', 'Картинка в картинці'],
      ['F', 'Повний екран'],
    ],
    layers: {
      title: 'Повний кадр.',
      text: 'Керування живе на власній поверхні, а не лежить поверх фільму.',
      items: [
        ['Назва', 'Назва відео, розділ і стан відтворення.'],
        ['Зображення', 'Панель керування не перекриває фільм.'],
        ['Керування', 'Окрема поверхня для дій і навігації.'],
      ],
      alt: 'Схема інтерфейсу: три шари плеєра, трохи розсунуті. Чорна смуга назви, кадр фільму і червона смуга керування.',
      caption: 'Схема інтерфейсу. Шари розділено для наочності.',
    },
    timeline: {
      title: 'Керування\nчасом.',
      text: 'Зрозуміла лінійка, кадри попереднього перегляду й розділи роблять шкалу чимось більшим за смугу прогресу.',
      recorded: 'Запис із плеєра.',
      play: 'Відтворити запис',
      pause: 'Пауза',
      alt: 'Запис руху вказівника вздовж лінійки: з’являється кадр попереднього перегляду і час.',
      gotoAlt: 'Панель керування з відкритим полем часу, у ньому введено 0:07.',
      goto: 'Клацніть час, введіть х:сс і натисніть Enter: плеєр перейде саме до цієї миті.',
      feature: { label: 'Особливість', heading: 'Введіть час' },
      items: [
        ['Читання', 'Бачите свою позицію.'],
        ['Перегляд', 'Перевірте кадр.'],
        ['Перехід', 'Оберіть розділ.'],
      ],
    },
    responsive: {
      title: 'Мобільна\nадаптація',
      text: 'Той самий плеєр у вузькому вікні: шкала зберігає своє місце, решта кнопок переходить до другого рядка, налаштування відкриваються всередині плеєра.',
      labels: ['01 / ВІДТВОРЕННЯ', '02 / НАЛАШТУВАННЯ'],
      playing: 'Два рядки. Одна зрозуміла шкала.',
      sheet: 'Налаштування лишаються всередині плеєра.',
      windowPlayer: (w, p) => `Вікно ${w} px · плеєр ${p} px`,
      alts: {
        playing: 'Вузький плеєр: панель керування у два рядки.',
        sheet: 'Вузький плеєр із відкритою шторкою налаштувань над зображенням.',
      },
    },
    states: {
      title: 'Стани плеєра.',
      text: 'Фокус, меню, субтитри, відновлення, завантаження й помилка: не лише спокійний перший кадр.',
      group: 'Стани плеєра',
      hint: 'Оберіть стан, щоб побачити його на плеєрі.',
      labels: { focus: 'Фокус', settings: 'Налаштування', captions: 'Субтитри', restored: 'Відновлено', loading: 'Завантаження', error: 'Помилка' },
      notes: {
        focus: 'Чіткий маркер фокуса на лінійці. Контрастне кільце на кнопках.',
        settings: 'Швидкість, якість, субтитри, розділи й колір в одному меню з квадратною геометрією панелі. Вибране позначене знаком, а не заливкою. «Колір» перемикає весь скін між червоним і моно.',
        captions: 'Субтитри розташовані над смугою керування, а не під нею.',
        restored: 'Збережена позиція повертається з коротким написом «Продовжено». Позиції зберігаються для відео довших за 15 секунд, тож 30-секундний демо-фільм це показує.',
        loading: 'Фрагмент лінійки на чорній підкладці: маркер крокує по рисках. Статус підписує стан словом, а не лише значком.',
        error: 'Значок і слово, а не самий лише колір; першою дією стоїть «Спробувати ще раз».',
      },
      alts: {
        focus: 'Лінійка перемотки з рамкою клавіатурного фокуса навколо вказівника.',
        settings: 'Меню налаштувань, відкрите над смугою керування.',
        captions: 'Субтитри на зображенні над смугою керування.',
        restored: 'Смуга назви з написом Resumed 0:15 після відновлення збереженої позиції.',
        loading: 'Маленька лінійка з маркером на чорному зображенні під час буферизації відео.',
        error: 'Повідомлення про помилку з кнопками Try again і OK.',
      },
    },
    formats: {
      title: 'Будь-який формат',
      text: 'Той самий скін і те саме керування для широкого, квадратного й вертикального відео.',
      items: [
        ['16:9', 'Широкий'],
        ['1:1', 'Квадратний'],
        ['9:16', 'Вертикальний'],
      ],
    },
    prefs: {
      title: 'Уподобання.',
      text: 'Плеєр пам’ятає вас, говорить вашою мовою і підлаштовується під те, як ви ним користуєтесь.',
      items: [
        ['Пам’ять', 'Запам’ятовує швидкість, звук, мову субтитрів і позицію кожного відео. Одна команда скидає все.'],
        ['Мови', 'Скін говорить англійською та українською; решта йде з перекладів Video.js.'],
        ['Доступність', 'Стилі для зменшення руху та високого контрасту, а зміни стану озвучуються для скрінрідерів.'],
        ['Дотик', 'Двічі торкніться лівого або правого боку, щоб перемотати, центру, щоб увімкнути повний екран.'],
      ],
    },
    keyboard: {
      title: 'Навігація.',
      text: 'До будь-якої миті: клавішами та фокусом.',
      keysTitle: 'Скорочення',
      keysText: 'Кожен елемент працює з клавіатури, коли плеєр у фокусі.',
      or: 'або',
      focus: {
        heading: 'Фокус',
        title: 'Як побачити фокус клавіатури',
        text: 'Клацніть плеєр і натискайте Tab, щоб переходити від елемента до елемента. Рамка завжди показує, де ви. Вона з’являється для клавіатури, а не для миші.',
        marker: 'На лінійці: чорна рамка навколо маркера. Стрілки пересувають маркер.',
        button: 'На кнопці: біле кільце з чорним краєм. Пробіл або Enter натискає її.',
        markerAlt: 'Лінійка з чорною рамкою клавіатурного фокуса навколо маркера.',
        buttonAlt: 'Кнопка налаштувань із білим кільцем клавіатурного фокуса та чорним краєм.',
      },
    },
    use: {
      title: 'Ваше відео.\nВаш плеєр.',
      text: 'Скін — це компонент React на Video.js v10. Скопіюйте папку src/ у React-проєкт, обгорніть ним своє медіа й дайте кожному відео стійкий resumeKey.',
      source: 'Переглянути код',
      workbench: 'Відкрити робочий стенд',
      exampleTitle: 'Приклад підключення',
      testingTitle: 'Перевірка та сумісність',
      testingText: 'Перевірено в Chrome на Windows. Safari та допоміжні технології поки не перевірено.',
      languagesLine: 'Мови інтерфейсу: English / Українська.',
      detailsTitle: 'Деталі перевірки',
      checkedTitle: 'Перевірено',
      checked: [],
      notTestedTitle: 'Не перевірено',
      notTested: [
        'Safari.',
        'Справжній скрінрідер (NVDA, JAWS, VoiceOver, TalkBack).',
        'Масштаб браузера 200% та екрани з дробовим масштабом (125%, 150%).',
      ],
      notesTitle: 'Як',
      notes: ['Перевірки автоматичні, у headless Chrome на Windows, без ручної сесії на пристрої.'],
    },
    footer: {
      groups: [
        ['Дизайн і код', 'Наталя Трусова · Apache 2.0'],
        ['Типографіка', 'Onest + IBM Plex Mono · OFL'],
        ['Демо-фільм', 'Freefall Bloom · фільм згенеровано ШІ, музика авторки'],
      ],
      rightsTitle: 'Демо-відео та права',
      rights: [
        'Фільм згенеровано ШІ та створено авторкою для цієї сторінки, музика теж авторки. Умови його повторного використання залежать від умов генератора; тут їх не підтверджено, тож перевірте їх, перш ніж використовувати фільм деінде.',
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
