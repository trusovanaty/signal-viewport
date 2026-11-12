import { useLocale, useTranslator } from '@videojs/react/i18n';

/**
 * Every piece of copy the skin adds itself, in one place per language. Words Video.js already translates (Speed, Quality,
 * Captions, Volume, Paused, Playing, the error texts, ...) are not repeated here: they come from its own locale packs, so
 * they follow the player's language in 50+ languages. Anything the skin adds is looked up in this table:
 * the exact locale (`pt-BR`), then its language (`pt`), then English. To add a language, add one object below.
 */
export interface Copy {
  /** Status words in the title strip (Paused and Playing come from Video.js). */
  ready: string;
  buffering: string;
  ended: string;
  error: string;
  chapters: string;
  startOver: string;
  resetSaved: string;
  tryAgain: string;
  /** Shown briefly after a saved position is restored; `{time}` is the position, e.g. 0:47. */
  resumed: string;
  /** `{height}` is the playing rendition's height, e.g. 720. */
  nowPlaying: string;
  /** Accessible name of the settings button; `{speed}` is the current speed, e.g. 1.5×. */
  settingsWithSpeed: string;
  settings: string;
  /** Label before a technical error detail (the engine's own message, which is not translated). */
  details: string;
}

const en: Copy = {
  ready: 'Ready',
  buffering: 'Buffering',
  ended: 'Ended',
  error: 'Error',
  chapters: 'Chapters',
  startOver: 'Start over',
  resetSaved: 'Reset saved settings',
  tryAgain: 'Try again',
  resumed: 'Resumed {time}',
  nowPlaying: 'Now playing {height}p',
  settingsWithSpeed: 'Playback settings, speed {speed}',
  settings: 'Playback settings',
  details: 'Details',
};

const uk: Copy = {
  ready: 'Готово',
  buffering: 'Завантаження',
  ended: 'Завершено',
  error: 'Помилка',
  chapters: 'Розділи',
  startOver: 'Почати спочатку',
  resetSaved: 'Скинути збережені налаштування',
  tryAgain: 'Спробувати ще раз',
  resumed: 'Продовжено з {time}',
  nowPlaying: 'Зараз відтворюється {height}p',
  settingsWithSpeed: 'Налаштування відтворення, швидкість {speed}',
  settings: 'Налаштування відтворення',
  details: 'Деталі',
};

const dictionaries: Record<string, Copy> = { en, uk };

/** The skin's own copy for a locale, with English as the last resort. */
export function copyFor(locale: string): Copy {
  const language = locale.split('-')[0] ?? 'en';
  return dictionaries[locale] ?? dictionaries[language] ?? en;
}

/** Fills `{name}` placeholders. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/**
 * Everything user-visible that the skin needs, in the player's language: the skin's own copy plus the Video.js phrases it
 * reuses (so those follow every locale Video.js ships, not only the ones listed above).
 */
export function useCopy() {
  const locale = useLocale();
  const t = useTranslator();
  const own = copyFor(locale);
  return {
    ...own,
    locale,
    speed: t('menu.speed', { default: 'Speed' }),
    quality: t('menu.quality', { default: 'Quality' }),
    captions: t('menu.captions', { default: 'Captions' }),
    volume: t('volume.label', { default: 'Volume' }),
    playing: t('status.playing', { default: 'Playing' }),
    paused: t('status.paused', { default: 'Paused' }),
    /** The friendly text for a media error code, in Video.js's own wording and languages. */
    errorText(code: number | undefined): string {
      switch (code) {
        case 1:
          return t('errors.aborted', { default: 'You stopped media playback before it finished.' });
        case 2:
          return t('errors.network', { default: 'This media could not be loaded due to a network or server issue.' });
        case 3:
          return t('errors.decode', { default: 'This media could not be played. It may be corrupted, or your browser may not support its format.' });
        case 4:
          return t('errors.source', { default: 'This media could not be loaded. It may be unavailable, or your browser may not support its format.' });
        case 5:
          return t('errors.encrypted', { default: 'This media could not be played because it could not be decrypted.' });
        default:
          return t('errors.unexpected', { default: 'An unexpected error occurred.' });
      }
    },
    resumedText: (time: string) => fill(own.resumed, { time }),
    nowPlayingText: (height: number) => fill(own.nowPlaying, { height }),
    settingsLabel: (speed: string | null) => (speed ? fill(own.settingsWithSpeed, { speed }) : own.settings),
  };
}
