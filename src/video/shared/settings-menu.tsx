/** @jsxImportSource react */

import { Menu, Thumbnail, useCaptionsOptions, usePlaybackRateOptions, useQualityOptions } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { type ReactNode, useContext, useEffect, useRef } from 'react';

import { SettingsIcon } from './icons';
import { formatTime } from '../format';
import { useCopy } from '../i18n';
import { ThemeSwitchContext, setSignalTheme, useHasSavedPreferences, useResetPreferences, useSignalTheme } from './preferences';
import { useHasSavedPosition, useStartOver } from './resume';

/**
 * Moves focus to the first menu item as soon as the menu opens. The library does this itself, but only once its own
 * placement matches the popup; the narrow layout re-anchors the sheet over the panel with CSS, so we do it explicitly.
 * Mounts with the popup, which only exists while the menu is open.
 */
function FocusFirstItem({ submenu }: { submenu?: string } = {}) {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const popup = marker.current?.closest<HTMLElement>('.signal-menu');
    if (!popup) return;
    const frame = requestAnimationFrame(() => {
      const panel = marker.current?.parentElement;
      if (!panel || panel.contains(document.activeElement)) return;
      // A submenu opens on its selected option (or its first one); the root menu on its first row.
      const target = submenu
        ? (panel.querySelector<HTMLElement>('[role="menuitemradio"][aria-checked="true"]') ??
          panel.querySelector<HTMLElement>('[role="menuitemradio"]'))
        : panel.querySelector<HTMLElement>('[data-item]');
      target?.focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(frame);
      // Leaving a submenu (Back, ArrowLeft): hand focus back to the row that opened it, unless the whole menu closed.
      if (submenu) {
        requestAnimationFrame(() => {
          if (!popup.isConnected) return;
          const row = [...popup.querySelectorAll<HTMLElement>('[data-has-submenu]')].find((el) =>
            el.textContent?.trim().startsWith(submenu)
          );
          row?.focus({ preventScroll: true });
        });
      }
    };
  }, [submenu]);
  return <span ref={marker} hidden />;
}

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  tier?: string;
  badge?: string;
  /** Content before the label, such as a chapter's start time and frame. */
  leading?: ReactNode;
}

interface Picker {
  value: string;
  setValue: (value: string) => void;
  options: readonly Option[];
  selectedLabel: string;
}

function Radios({ label, picker, note }: { label: string; picker: Picker; note?: ReactNode }) {
  return (
    <>
      <Menu.RadioGroup
        className="signal-menu-group"
        value={picker.value}
        onValueChange={picker.setValue}
        aria-label={label}
      >
        {picker.options.map((option) => (
          <Menu.RadioItem key={option.value} value={option.value} disabled={option.disabled} className="signal-menu-item">
            {option.leading}
            <span className="signal-menu-label">
              {option.label}
              {option.tier ? <sup className="signal-menu-tier">{option.tier}</sup> : null}
            </span>
            {option.badge ? <span className="signal-menu-badge">{option.badge}</span> : null}
            <Menu.ItemIndicator checked={option.value === picker.value} forceMount className="signal-menu-check" />
          </Menu.RadioItem>
        ))}
      </Menu.RadioGroup>
      {note}
    </>
  );
}

/** A top-level row that opens a submenu with one section's radio options. */
function Section({ title, picker, note }: { title: string; picker: Picker; note?: ReactNode }) {
  return (
    <Menu.Root>
      <Menu.Trigger
        className="signal-menu-item"
        render={(props) => (
          <div {...props}>
            <span className="signal-menu-title">{title}</span>
            <span className="signal-menu-value">
              <span className="signal-menu-value-text">{picker.selectedLabel}</span>
              <span aria-hidden="true">›</span>
            </span>
          </div>
        )}
      />
      <Menu.Content className="signal-menu-panel">
        <FocusFirstItem submenu={title} />
        <Menu.Item className="signal-menu-item signal-menu-back">
          <span aria-hidden="true">‹</span>
          {title}
        </Menu.Item>
        <Radios label={title} picker={picker} note={note} />
      </Menu.Content>
    </Menu.Root>
  );
}

/**
 * One settings menu. Sections (Speed, Quality, Captions) appear only when the source and browser really offer them. With
 * a single section the options are listed directly; with several, each section is a submenu.
 */
export function SettingsMenu() {
  const rate = usePlaybackRateOptions();
  const quality = useQualityOptions();
  const captions = useCaptionsOptions();
  const activeHeight = usePlayer((s) => s.activeVideoRendition?.height);
  const store = usePlayer();
  const cues = usePlayer((s) => s.chaptersCues);
  const currentTime = usePlayer((s) => s.currentTime);
  const hasThumbnails = usePlayer((s) => !!s.thumbnailsTrack);
  const copy = useCopy();
  const savedPrefs = useHasSavedPreferences();
  const resetPreferences = useResetPreferences();
  const hasPosition = useHasSavedPosition();
  const startOver = useStartOver();
  const themeSwitch = useContext(ThemeSwitchContext);
  const theme = useSignalTheme();

  const hasRate = rate?.state.availability === 'available';
  const hasQuality = quality?.state.availability === 'available';
  const hasCaptions = captions?.state.availability === 'available';
  const hasChapters = !!cues && cues.length > 0;
  if (!hasRate && !hasQuality && !hasCaptions && !hasChapters && !themeSwitch) return null;

  const count = Number(hasRate) + Number(hasQuality) + Number(hasCaptions) + Number(hasChapters) + Number(themeSwitch);

  // Colour is an option of the skin itself, offered only where the host page turned it on.
  const colourPicker: Picker | null = themeSwitch
    ? {
        value: theme,
        setValue: (v) => setSignalTheme(v === 'mono' ? 'mono' : 'red'),
        selectedLabel: theme === 'mono' ? copy.colourMono : copy.colourRed,
        options: [
          { value: 'red', label: copy.colourRed },
          { value: 'mono', label: copy.colourMono },
        ],
      }
    : null;

  // Chapters come from the source's chapter track. A frame is shown only when the source also has a storyboard.
  let activeChapter = 0;
  cues?.forEach((cue, i) => {
    if (currentTime >= cue.startTime) activeChapter = i;
  });
  const chaptersPicker: Picker | null = hasChapters
    ? {
        value: String(activeChapter),
        setValue: (v) => {
          const cue = cues![Number(v)];
          if (cue) store.seek(cue.startTime);
        },
        selectedLabel: cues![activeChapter]?.text ?? '',
        options: cues!.map((cue, i) => ({
          value: String(i),
          label: cue.text,
          leading: (
            <span className="signal-chapter-lead">
              {hasThumbnails ? (
                <Thumbnail.Root time={cue.startTime} className="signal-chapter-frame">
                  <Thumbnail.Image className="signal-chapter-img" />
                </Thumbnail.Root>
              ) : null}
              <span className="signal-chapter-time">{formatTime(cue.startTime)}</span>
            </span>
          ),
        })),
      }
    : null;
  // The library labels the automatic mode with the resolution playing ("Auto (720p)"). Keep the chosen mode and the
  // actual resolution apart: the mode is shown here, the resolution in a separate note.
  const modeOnly = (label: string) => label.replace(/\s*\(\d+p\)\s*$/, '');
  const qualityPicker: Picker | null = hasQuality
    ? {
        ...quality,
        selectedLabel: modeOnly(quality.selectedLabel),
        options: quality.options.map((o) => (o.value === 'auto' ? { ...o, label: modeOnly(o.label) } : o)),
      }
    : null;
  const speed = hasRate ? rate.selectedLabel : null;
  // The chosen mode ("Auto") and the resolution actually playing are different facts, so they are shown separately.
  const qualityNote = activeHeight ? <div className="signal-menu-note">{copy.nowPlayingText(activeHeight)}</div> : null;

  return (
    <Menu.Root side="top" align="end">
      <Menu.Trigger
        className="signal-btn signal-btn--menu"
        aria-label={copy.settingsLabel(speed)}
        render={<button type="button" />}
      >
        <SettingsIcon className="signal-icon" />
        {speed ? <span className="signal-speed">{speed}</span> : null}
      </Menu.Trigger>
      <Menu.Popup className="signal-menu">
        <Menu.Content className="signal-menu-panel">
          <FocusFirstItem />
          {count === 1 && hasRate ? <Radios label={copy.speed} picker={rate} /> : null}
          {count === 1 && qualityPicker ? <Radios label={copy.quality} picker={qualityPicker} note={qualityNote} /> : null}
          {count === 1 && hasCaptions ? <Radios label={copy.captions} picker={captions} /> : null}
          {count === 1 && chaptersPicker ? <Radios label={copy.chapters} picker={chaptersPicker} /> : null}
          {count === 1 && colourPicker ? <Radios label={copy.colour} picker={colourPicker} /> : null}
          {count > 1 && hasRate ? <Section title={copy.speed} picker={rate} /> : null}
          {count > 1 && qualityPicker ? <Section title={copy.quality} picker={qualityPicker} note={qualityNote} /> : null}
          {count > 1 && hasCaptions ? <Section title={copy.captions} picker={captions} /> : null}
          {count > 1 && chaptersPicker ? <Section title={copy.chapters} picker={chaptersPicker} /> : null}
          {count > 1 && colourPicker ? <Section title={copy.colour} picker={colourPicker} /> : null}
          {hasPosition ? (
            <Menu.Item className="signal-menu-item signal-menu-reset" onClick={startOver}>
              {copy.startOver}
            </Menu.Item>
          ) : null}
          {savedPrefs ? (
            <Menu.Item className="signal-menu-item signal-menu-reset" onClick={resetPreferences}>
              {copy.resetSaved}
            </Menu.Item>
          ) : null}
        </Menu.Content>
      </Menu.Popup>
    </Menu.Root>
  );
}
