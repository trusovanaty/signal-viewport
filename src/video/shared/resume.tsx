/** @jsxImportSource react */

import { usePlayer } from '@videojs/react/video';
import { useEffect, useRef, useSyncExternalStore } from 'react';

/**
 * Resume position, kept per video. One storage entry holds a small map keyed by the video's id (the `resumeKey` prop,
 * else the resolved title; the media URL is a `blob:` address for streamed sources, so it cannot identify a video).
 * Without an id nothing is saved. Reads and writes are guarded, the map is capped, and an entry is ignored when its
 * recorded duration does not match the loaded video, so a re-cut or a different video with the same title starts at 0.
 */
const KEY = 'signal-viewport:resume';
const VERSION = 1;
const MAX_ENTRIES = 30;
/** Positions inside the first seconds are not worth resuming. */
const MIN_SECONDS = 5;
/** Within this many seconds of the end the video counts as finished. */
const END_MARGIN = 10;
/** Saved duration may differ from the loaded one by this much (container rounding). */
const DURATION_TOLERANCE = 2;
const SAVE_EVERY_MS = 5000;

interface Entry {
  t: number;
  d: number;
  at: number;
}
type Items = Record<string, Entry>;

function readItems(): Items {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const value = JSON.parse(raw) as { v?: number; items?: Record<string, Partial<Entry>> };
    if (value?.v !== VERSION || typeof value.items !== 'object' || !value.items) return {};
    const items: Items = {};
    for (const [id, e] of Object.entries(value.items)) {
      if (e && Number.isFinite(e.t) && Number.isFinite(e.d) && Number.isFinite(e.at) && e.t! >= 0 && e.d! > 0) {
        items[id] = { t: e.t!, d: e.d!, at: e.at! };
      }
    }
    return items;
  } catch {
    return {};
  }
}

function writeItems(items: Items) {
  try {
    // Keep only the most recently watched videos so the entry cannot grow without bound.
    const newest = Object.entries(items)
      .sort((a, b) => b[1].at - a[1].at)
      .slice(0, MAX_ENTRIES);
    if (newest.length === 0) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify({ v: VERSION, items: Object.fromEntries(newest) }));
  } catch {
    // Storage unavailable: carry on without resume.
  }
}

// A tiny external store: does the current video have a saved position? (drives the "Start over" menu row)
const listeners = new Set<() => void>();
let currentId: string | null = null;
let present = false;

function refreshPresent() {
  const next = currentId ? currentId in readItems() : false;
  if (next === present) return;
  present = next;
  listeners.forEach((l) => l());
}

function setCurrentId(id: string | null) {
  currentId = id;
  refreshPresent();
}

function save(id: string, t: number, d: number) {
  const items = readItems();
  items[id] = { t: Math.floor(t), d: Math.round(d), at: Date.now() };
  writeItems(items);
  refreshPresent();
}

function forget(id: string) {
  const items = readItems();
  if (!(id in items)) return;
  delete items[id];
  writeItems(items);
  refreshPresent();
}

// A short-lived notice, "Resumed 0:47", for the title strip (and a screen reader) after a saved position is restored.
const NOTICE_MS = 4000;
const noticeListeners = new Set<() => void>();
let notice: { seconds: number } | null = null;
let noticeTimer: ReturnType<typeof setTimeout> | undefined;

function showNotice(seconds: number) {
  notice = { seconds };
  noticeListeners.forEach((l) => l());
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => {
    notice = null;
    noticeListeners.forEach((l) => l());
  }, NOTICE_MS);
}

/** The position that was just restored, for a few seconds after it happened; otherwise null. */
export function useResumeNotice(): { seconds: number } | null {
  return useSyncExternalStore(
    (cb) => {
      noticeListeners.add(cb);
      return () => noticeListeners.delete(cb);
    },
    () => notice,
    () => null
  );
}

export function useHasSavedPosition(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => present,
    () => false
  );
}

/** Returns a function that jumps to the start and forgets the saved position. */
export function useStartOver() {
  const store = usePlayer();
  return () => {
    if (currentId) forget(currentId);
    void Promise.resolve(store.seek(0)).catch(() => undefined);
  };
}

/** Restores the saved position once metadata is known, then keeps saving it. Renders nothing. */
export function Resume({ resumeKey }: { resumeKey?: string } = {}) {
  const store = usePlayer();
  const title = usePlayer((s) => s.title);
  const duration = usePlayer((s) => s.duration);
  const currentTime = usePlayer((s) => s.currentTime);
  const paused = usePlayer((s) => s.paused);
  const ended = usePlayer((s) => s.ended);
  const started = usePlayer((s) => s.started);

  const id = (resumeKey ?? title ?? '').trim() || null;
  const decided = useRef<string | null>(null); // the id whose saved position has been handled
  const latest = useRef({ id, currentTime, duration, ended });
  latest.current = { id, currentTime, duration, ended };

  useEffect(() => {
    setCurrentId(id);
    decided.current = null;
  }, [id]);

  // Restore once per video, as soon as its duration is known.
  useEffect(() => {
    if (!id || !(duration > 0) || decided.current === id) return;
    decided.current = id;
    const entry = readItems()[id];
    if (!entry || started) return;
    const usable =
      Math.abs(entry.d - duration) <= DURATION_TOLERANCE && entry.t >= MIN_SECONDS && entry.t < duration - END_MARGIN;
    if (!usable) {
      forget(id);
      return;
    }
    void Promise.resolve(store.seek(entry.t)).catch(() => undefined);
    showNotice(entry.t);
  }, [store, id, duration, started]);

  // Save: now and then while playing, on pause, when the tab is hidden or closed. Finished videos are forgotten.
  useEffect(() => {
    const persist = () => {
      const { id: vid, currentTime: t, duration: d, ended: done } = latest.current;
      if (!vid || !(d > 0) || decided.current !== vid) return; // nothing is written before the restore decision
      if (done || t >= d - END_MARGIN) forget(vid);
      else if (t >= MIN_SECONDS) save(vid, t, d);
    };
    const onHide = () => {
      if (document.visibilityState === 'hidden') persist();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', persist);
    const timer = paused ? undefined : window.setInterval(persist, SAVE_EVERY_MS);
    persist(); // also covers pause and the end
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', persist);
      if (timer) window.clearInterval(timer);
    };
  }, [paused, ended, id]);

  return null;
}
