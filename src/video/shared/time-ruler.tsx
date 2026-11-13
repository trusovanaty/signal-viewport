/** @jsxImportSource react */

import { Slider, TimeSlider } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { formatTime } from '../format';

const STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200];
/** Minor ticks between two major ticks, so a major tick is every `MINORS` minor ticks. */
const MINORS = 5;
const MAX_MAJORS = 8;
/** One character of the 12px IBM Plex Mono labels (advance 0.6em). */
const LABEL_CHAR_PX = 7.2;
/** Minor ticks closer than this (px) are left out, so a narrow ruler keeps its ticks but never a crowded row of them. */
const MIN_MINOR_PX = 7;
/** Width assumed until the ruler has been measured. */
const DEFAULT_WIDTH = 480;
/** How long the ruler stays without its glide after a replay (ms); normal playback then glides as before. */
const SNAP_MS = 400;

interface Tick {
  key: number;
  percent: number;
  major: boolean;
  label: string | null;
  /** The last tick: its label is right-aligned to the end of the ruler, so the end of the film is always named. */
  end?: boolean;
}

/**
 * Evenly spaced ticks from a "nice" step, so labels read as 0:30, 1:00, 1:30 rather than arbitrary times. The step is
 * chosen from the ruler's real width and the width of the longest label (`4:00` vs `1:30:00`), so labels never touch:
 * the first label is left-aligned and the others centered on their tick, which needs 1.5 label widths between ticks.
 */
export function buildTicks(duration: number, width: number): Tick[] {
  if (!Number.isFinite(duration) || duration <= 0) return [];
  const chars = duration >= 3600 ? 7 : duration >= 600 ? 5 : 4;
  const labelWidth = chars * LABEL_CHAR_PX;
  const minSpacing = labelWidth * 1.5 + 8;
  const maxMajors = Math.max(2, Math.min(MAX_MAJORS, Math.floor(width / minSpacing)));
  const step = STEPS.find((s) => s >= duration / maxMajors) ?? STEPS[STEPS.length - 1]!;
  const minorStep = step / MINORS;
  const ticks: Tick[] = [];
  for (let i = 0; i * minorStep <= duration + 1e-6; i++) {
    const time = i * minorStep;
    const major = i % MINORS === 0;
    if (!major && (minorStep / duration) * width < MIN_MINOR_PX) continue;
    const percent = (time / duration) * 100;
    // Skip the label unless all of it fits inside the right edge of the ruler (it is centered on its tick).
    const fits = (percent / 100) * width + labelWidth / 2 <= width;
    // The last major tick of a ruler: when its centered label would run past the right edge, the label is right-aligned
    // to the tick instead of being dropped, so the end of the ruler is named (there is room: ticks are 1.5 labels apart).
    const lastMajor = major && (i + MINORS) * minorStep > duration + 1e-6;
    const isEnd = lastMajor && !fits;
    const label = major && (fits || isEnd) ? formatTime(time) : null;
    ticks.push({ key: i, percent, major, label, end: isEnd });
  }
  return ticks;
}

function Ticks({ ticks, labels, className }: { ticks: Tick[]; labels?: boolean; className: string }) {
  return (
    <div className={className} aria-hidden="true">
      {ticks.map((tick) => (
        <span
          key={tick.key}
          className={`signal-tick ${tick.major ? 'signal-tick--major' : 'signal-tick--minor'}${tick.end ? ' signal-tick--end' : ''}`}
          style={{ left: `${tick.percent}%` }}
        >
          {labels && tick.label ? <span className="signal-tick-label">{tick.label}</span> : null}
        </span>
      ))}
    </div>
  );
}

/** The seek control: a real `TimeSlider` drawn as a time ruler, so keyboard, pointer, and touch seeking all work. */
export function TimeRuler(): ReactNode {
  const duration = usePlayer((s) => s.duration);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const rootRef = useRef<HTMLElement | null>(null);
  // Replay after the end: the pin, the fill and the played ticks return to the start at once instead of sweeping back
  // across the whole ruler. Only a play that starts from the ended state does this; seeks and normal playback are untouched.
  useEffect(() => {
    const el = rootRef.current;
    const scope: ParentNode & EventTarget = el?.closest('.signal-skin') ?? document;
    if (!el) return;
    let endedSeen = false;
    let timer = 0;
    const snap = () => {
      el.setAttribute('data-snap', '');
      window.clearTimeout(timer);
      timer = window.setTimeout(() => el.removeAttribute('data-snap'), SNAP_MS);
    };
    const onEnded = () => {
      endedSeen = true;
    };
    const onRestart = (e: Event) => {
      const media = e.target as HTMLMediaElement;
      if (!endedSeen || !(media instanceof HTMLMediaElement)) return;
      if (media.paused) {
        // Moved after the end without playing (a seek): not a replay, and the pending end is over.
        if (e.type === 'seeking') endedSeen = false;
        return;
      }
      endedSeen = false;
      snap();
    };
    scope.addEventListener('ended', onEnded, true);
    scope.addEventListener('seeking', onRestart, true);
    scope.addEventListener('play', onRestart, true);
    return () => {
      window.clearTimeout(timer);
      scope.removeEventListener('ended', onEnded, true);
      scope.removeEventListener('seeking', onRestart, true);
      scope.removeEventListener('play', onRestart, true);
    };
  }, []);
  // Track the ruler's width (it changes with the player, fullscreen and the volume slider appearing).
  const measure = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    rootRef.current = el;
    setWidth(el.getBoundingClientRect().width || DEFAULT_WIDTH);
    const observer = new ResizeObserver(() => setWidth(el.getBoundingClientRect().width || DEFAULT_WIDTH));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const ticks = useMemo(() => buildTicks(duration, width), [duration, Math.round(width / 8)]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TimeSlider.Root className="signal-ruler" ref={measure}>
      <Ticks ticks={ticks} labels className="signal-ticks signal-ticks--base" />
      <Ticks ticks={ticks} className="signal-ticks signal-ticks--played" />
      <TimeSlider.Track className="signal-rail">
        <TimeSlider.Fill className="signal-rail-fill" />
      </TimeSlider.Track>
      <TimeSlider.Thumb className="signal-playhead" />
      {/* The frame under the pointer. Hidden (data-hidden) when the source has no storyboard track. */}
      <Slider.Thumbnail.Root className="signal-thumb-frame">
        <Slider.Thumbnail.Image className="signal-thumb-img" />
      </Slider.Thumbnail.Root>
      <TimeSlider.Preview className="signal-pointer-chip">
        <TimeSlider.Value type="pointer" />
      </TimeSlider.Preview>
    </TimeSlider.Root>
  );
}
