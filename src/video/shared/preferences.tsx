/** @jsxImportSource react */

import { usePlayer } from '@videojs/react/video';
import { createContext, useEffect, useRef, useSyncExternalStore } from 'react';

/**
 * Saved preferences: playback speed, mute, caption language and the colour theme. Stored as one small JSON object under a versioned key.
 * Storage can be blocked (private modes, embeds) or hold junk, so every read and write is guarded and playback never
 * depends on it. Only values that differ from the defaults are kept: setting everything back to the defaults clears the
 * entry, which is also what "Reset saved settings" does.
 */
const KEY = 'signal-viewport:prefs';
const VERSION = 1;

interface Prefs {
  rate: number;
  muted: boolean;
  /** A language code such as `en`, or `off`. Language is stable across sources; track ids are not. */
  captions: string;
  /** The skin's colour theme: the signature red panel, or the neutral mono one. */
  theme: SignalTheme;
}

export type SignalTheme = 'red' | 'mono';

const DEFAULTS: Prefs = { rate: 1, muted: false, captions: 'off', theme: 'red' };

function read(): Prefs | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<Prefs> & { v?: number };
    if (value?.v !== VERSION) return null; // unknown format: ignore it, never crash on it
    return {
      rate: typeof value.rate === 'number' && value.rate > 0 && value.rate <= 16 ? value.rate : DEFAULTS.rate,
      muted: typeof value.muted === 'boolean' ? value.muted : DEFAULTS.muted,
      captions: typeof value.captions === 'string' && value.captions.length <= 35 ? value.captions : DEFAULTS.captions,
      theme: value.theme === 'mono' ? 'mono' : DEFAULTS.theme,
    };
  } catch {
    return null;
  }
}

const isDefault = (p: Prefs) =>
  p.rate === DEFAULTS.rate && p.muted === DEFAULTS.muted && p.captions === DEFAULTS.captions && p.theme === DEFAULTS.theme;

// A tiny external store so the menu can show "Reset saved settings" only while something is actually saved.
const listeners = new Set<() => void>();
let hasSaved = false;
let savedCaptions = DEFAULTS.captions;
let theme: SignalTheme = DEFAULTS.theme;
const initial = read();
if (initial) {
  hasSaved = !isDefault(initial);
  savedCaptions = initial.captions;
  theme = initial.theme;
}

function setHasSaved(next: boolean) {
  if (hasSaved === next) return;
  hasSaved = next;
  listeners.forEach((l) => l());
}

function write(prefs: Prefs) {
  try {
    if (isDefault(prefs)) {
      localStorage.removeItem(KEY);
      setHasSaved(false);
    } else {
      localStorage.setItem(KEY, JSON.stringify({ v: VERSION, ...prefs }));
      setHasSaved(true);
    }
  } catch {
    // Storage unavailable: carry on without persistence.
  }
}

const themeListeners = new Set<() => void>();

/** The colour theme, shared by every player on the page that offers the switch. */
export function useSignalTheme(): SignalTheme {
  return useSyncExternalStore(
    (cb) => {
      themeListeners.add(cb);
      return () => themeListeners.delete(cb);
    },
    () => theme,
    () => DEFAULTS.theme
  );
}

/** Sets the theme. `persist: false` is for a theme that comes from the address (an embed), which is not the visitor's choice. */
export function setSignalTheme(next: SignalTheme, persist = true) {
  if (theme === next) return;
  theme = next;
  themeListeners.forEach((l) => l());
  if (persist) write({ ...(read() ?? DEFAULTS), theme });
}

/** True where the host page turned the colour option on (`themeSwitch` on the skin); the menu shows it only then. */
export const ThemeSwitchContext = createContext(false);

export function useHasSavedPreferences(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => hasSaved,
    () => false
  );
}

/** Returns a function that puts speed, mute, captions and the theme back to defaults and forgets the saved entry. */
export function useResetPreferences() {
  const store = usePlayer();
  return () => {
    savedCaptions = DEFAULTS.captions;
    theme = DEFAULTS.theme;
    themeListeners.forEach((l) => l());
    try { store.setPlaybackRate(DEFAULTS.rate); } catch { /* no media attached yet */ }
    try { store.setMuted(DEFAULTS.muted); } catch { /* no media attached yet */ }
    try { store.selectSubtitlesTrack(null); } catch { /* no captions */ }
    write(DEFAULTS);
  };
}

/** Restores saved preferences once media is attached, then saves later changes. Renders nothing. */
export function Preferences() {
  const store = usePlayer();
  const rate = usePlayer((s) => s.playbackRate);
  const muted = usePlayer((s) => s.muted);
  const duration = usePlayer((s) => s.duration);
  const tracks = usePlayer((s) => s.textTrackList);
  const saved = useRef(initial);
  const mutedRestored = useRef(false);
  const rateRestored = useRef(false);
  const captionsRestored = useRef(false);
  const lastSelection = useRef('off');

  // Mute: restore as soon as the store is attached to the media (actions throw before that).
  useEffect(() => {
    const restore = () => {
      if (!store.target) return false;
      if (saved.current?.muted) {
        try { store.setMuted(true); } catch { /* ignore */ }
      }
      mutedRestored.current = true;
      // With nothing to change for speed, there is nothing to wait for either.
      if (!saved.current || saved.current.rate === DEFAULTS.rate) rateRestored.current = true;
      return true;
    };
    if (restore()) return;
    const unsubscribe = store.subscribe(() => {
      if (restore()) unsubscribe();
    });
    return unsubscribe;
  }, [store]);

  // Speed: the engine resets the rate while it loads the source, so apply the saved one once metadata has arrived.
  useEffect(() => {
    if (rateRestored.current || !mutedRestored.current || !(duration > 0)) return;
    rateRestored.current = true;
    try { store.setPlaybackRate(saved.current?.rate ?? DEFAULTS.rate); } catch { /* unsupported source */ }
  }, [store, duration]);

  // Captions: restore once when the first subtitle list arrives (lists load with the media, not with the player).
  const subtitles = tracks.filter((t) => t.kind === 'captions' || t.kind === 'subtitles');
  const showing = subtitles.find((t) => t.mode === 'showing');
  const selection = showing ? showing.language : 'off';
  const hasSubtitles = subtitles.length > 0;
  // The list can arrive before its tracks have distinct ids; selecting by an empty or shared id would switch on
  // several tracks at once, so wait until every id is present and unique.
  const ids = subtitles.map((t) => t.id);
  const idsReady = hasSubtitles && ids.every(Boolean) && new Set(ids).size === ids.length;
  const idsKey = ids.join('|');
  // Also wait for metadata: the engine is still setting its own track modes before that.
  const metadataReady = duration > 0;
  useEffect(() => {
    if (!idsReady || !metadataReady || captionsRestored.current) return;
    captionsRestored.current = true;
    lastSelection.current = selection;
    if (savedCaptions !== 'off') {
      const wanted = subtitles.find((t) => t.language === savedCaptions);
      // A saved language this source lacks stays in storage until the user picks something else.
      if (wanted) store.selectSubtitlesTrack(wanted.id);
    }
  }, [store, idsReady, idsKey, metadataReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save later changes only: nothing is written before speed and mute are restored, and a caption change counts only
  // when the selection differs from the one seen at restore time.
  useEffect(() => {
    if (!mutedRestored.current || !rateRestored.current) return;
    if (hasSubtitles && !captionsRestored.current) return;
    if (captionsRestored.current && selection !== lastSelection.current) {
      lastSelection.current = selection;
      savedCaptions = selection;
    }
    write({ rate, muted, captions: savedCaptions, theme });
  }, [rate, muted, selection, hasSubtitles]);

  return null;
}
