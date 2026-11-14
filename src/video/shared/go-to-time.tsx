/** @jsxImportSource react */

import { Time } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { formatTime } from '../format';
import { useCopy } from '../i18n';

/**
 * Parses `m:ss` or `h:mm:ss` into seconds. Minutes may be any number in `m:ss` (a 90 minute film can be reached as
 * 90:00); in `h:mm:ss` minutes and seconds stop at 59. Returns null for anything else.
 */
export function parseTime(text: string): number | null {
  const value = text.trim();
  let match = /^(\d{1,4}):([0-5]?\d)$/.exec(value);
  if (match) return Number(match[1]) * 60 + Number(match[2]);
  match = /^(\d{1,3}):([0-5]?\d):([0-5]?\d)$/.exec(value);
  if (match) return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
  return null;
}

/**
 * Turns typed digits into a time as they are typed: the last two digits are seconds, the two before them minutes, and
 * anything before that hours (`2` → 0:02, `26` → 0:26, `126` → 1:26, `12345` → 1:23:45). Non-digits are dropped, leading
 * zeros do not count, and at most six digits are kept. Empty stays empty.
 */
export function maskTime(text: string): string {
  const digits = text.replace(/\D/g, '').replace(/^0+/, '').slice(-6);
  if (text.replace(/\D/g, '') === '') return '';
  const d = digits.padStart(3, '0');
  const seconds = d.slice(-2);
  const rest = d.slice(0, -2);
  if (rest.length <= 2) return `${Number(rest)}:${seconds}`;
  return `${Number(rest.slice(0, -2))}:${rest.slice(-2)}:${seconds}`;
}

/**
 * The elapsed time, as a button. Pressing it swaps the readout for a small "Go to time" field: Enter jumps (with the
 * player's own seek action, so play and pause stay as they were), Escape closes and gives focus back to the button.
 * Anything outside the video, or not in the two formats, is explained in a short message above the panel. Typing in the
 * field never reaches the hotkeys (Video.js ignores editable targets), and the saved-position logic only sees an
 * ordinary seek.
 */
export function GoToTime() {
  const copy = useCopy();
  const store = usePlayer();
  const duration = usePlayer((s) => s.duration);
  // Read when the field opens; the field is uncontrolled, so later ticks do not disturb typing.
  const currentTime = usePlayer((s) => s.currentTime);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [said, setSaid] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const errorId = useId();
  const usable = Number.isFinite(duration) && duration > 0;

  // Focus moves into the field when it opens, and back to the button when it closes by Escape or a jump.
  useEffect(() => {
    if (open) {
      input.current?.focus();
      input.current?.select();
    } else if (restoreFocus.current) {
      restoreFocus.current = false;
      button.current?.focus();
    }
  }, [open]);

  const close = (focusButton: boolean) => {
    restoreFocus.current = focusButton;
    setError(null);
    setOpen(false);
  };

  const submit = () => {
    const seconds = parseTime(input.current?.value ?? '');
    if (seconds === null) {
      setError(copy.goToFormat);
      return;
    }
    if (seconds > duration) {
      setError(copy.goToRangeText(formatTime(duration)));
      return;
    }
    void Promise.resolve(store.seek(seconds)).catch(() => undefined);
    setSaid(copy.wentToText(formatTime(seconds)));
    close(true);
  };

  if (!usable) return <Time.Value type="current" />;

  // The panel is the containing block of the message, so it can sit on the edge of the picture without moving anything.
  const panel = open ? form.current?.closest<HTMLElement>('.signal-panel') : null;

  return (
    <>
      {/* The button stays in the layout while the field is open (hidden and inert), so nothing around it moves. */}
      <button
        ref={button}
        type="button"
        className="signal-goto-button"
        aria-label={copy.goToTime}
        inert={open}
        data-open={open ? '' : undefined}
        onClick={() => {
          setSaid('');
          setOpen(true);
        }}
      >
        <Time.Value type="current" />
      </button>
      {open ? (
        <form
          ref={form}
          className="signal-goto"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <label className="signal-sr" htmlFor={`${errorId}-in`}>
            {copy.goToTime}
          </label>
          <input
            id={`${errorId}-in`}
            ref={input}
            className="signal-goto-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={9}
            size={8}
            placeholder={copy.goToPlaceholder}
            defaultValue={formatTime(currentTime)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => {
              setError(null);
              // Only digits are typed; the colons put themselves in. The last two digits are the seconds (like a timer),
              // so 26 reads 0:26 and 126 reads 1:26. A typed colon changes nothing: 1:30 and 130 are the same entry.
              const field = event.currentTarget;
              const deleting = String((event.nativeEvent as InputEvent).inputType ?? '').startsWith('delete');
              // Erasing the last digit empties the field instead of leaving 0:00 behind.
              const formatted = deleting && /^[0:]*$/.test(field.value) ? '' : maskTime(field.value);
              if (formatted !== field.value) {
                field.value = formatted;
                field.setSelectionRange(formatted.length, formatted.length);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                close(true);
              }
            }}
            onBlur={() => close(false)}
          />
        </form>
      ) : null}
      {open && error && panel
        ? createPortal(
            <span id={errorId} role="alert" className="signal-goto-error">
              {error}
            </span>,
            panel
          )
        : null}
      <span className="signal-sr" role="status">
        {said}
      </span>
    </>
  );
}
