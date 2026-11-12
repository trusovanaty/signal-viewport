/** @jsxImportSource react */

import { Slider, TimeSlider } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { formatTime } from '../format';

const STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200];
/** Minor ticks between two major ticks, so a major tick is every `MINORS` minor ticks. */
const MINORS = 5;
const MAX_MAJORS = 8;
/** One character of the 12px IBM Plex Mono labels (advance 0.6em). */
const LABEL_CHAR_PX = 7.2;
/** Width assumed until the ruler has been measured. */
const DEFAULT_WIDTH = 480;

interface Tick {
  key: number;
  percent: number;
  major: boolean;
  label: string | null;
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
    const percent = (time / duration) * 100;
    // Skip the label unless all of it fits inside the right edge of the ruler (it is centered on its tick).
    const label = major && (percent / 100) * width + labelWidth / 2 <= width ? formatTime(time) : null;
    ticks.push({ key: i, percent, major, label });
  }
  return ticks;
}

function Ticks({ ticks, labels, className }: { ticks: Tick[]; labels?: boolean; className: string }) {
  return (
    <div className={className} aria-hidden="true">
      {ticks.map((tick) => (
        <span
          key={tick.key}
          className={`signal-tick ${tick.major ? 'signal-tick--major' : 'signal-tick--minor'}`}
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
  // Track the ruler's width (it changes with the player, fullscreen and the volume slider appearing).
  const measure = useCallback((el: HTMLElement | null) => {
    if (!el) return;
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
