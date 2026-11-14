/** @jsxImportSource react */

import { ErrorDialog as ErrorDialogPrimitive, useMedia } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';

import { cn } from '@/lib/resolve-class-name';

import { useCopy } from '../i18n';
import { AlertIcon } from './icons';

const BUTTON =
  'h-12 min-w-24 cursor-pointer border-2 border-solid border-white px-4 text-media font-medium outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white';

/**
 * One manual retry: clears the error and asks the media to load its source again. The user starts it, once per click; the
 * streaming engine already retries brief network failures itself, so there is no automatic loop on top of that.
 */
function useRetry() {
  const store = usePlayer();
  const media = useMedia() as (HTMLMediaElement & { load?: () => void }) | null;
  return () => {
    store.dismissError();
    try {
      media?.load?.();
      void Promise.resolve(media?.play?.()).catch(() => undefined);
    } catch {
      // The source stays unavailable; the dialog will report the next failure.
    }
  };
}

/**
 * The friendly sentence comes from Video.js's own translated error texts, chosen by error code. The engine's own message
 * (for example "Timeout after 10000ms") is English only and technical, so it is kept apart as a labeled detail line
 * instead of being the text a viewer reads first.
 */
function ErrorText() {
  const copy = useCopy();
  const error = usePlayer((s) => s.error);
  const friendly = copy.errorText(error?.code);
  const detail = error?.message?.trim();
  return (
    <>
      {friendly}
      {detail && detail !== friendly ? (
        <span className="signal-error-detail">
          <span className="signal-error-detail-label">{copy.details}</span> {detail}
        </span>
      ) : null}
    </>
  );
}

export function ErrorDialog() {
  const retry = useRetry();
  const copy = useCopy();
  return (
    <ErrorDialogPrimitive.Root>
      <ErrorDialogPrimitive.Backdrop
        className={'absolute inset-0 z-40 bg-black not-data-open:hidden data-[scope=document]:fixed'}
      />
      <ErrorDialogPrimitive.Popup
        className={cn(
          'absolute left-1/2 top-1/2 z-50 grid w-[calc(100%-var(--media-spacing)*8)] max-w-80 max-h-[calc(100%-var(--media-spacing)*8)] transform-[translate(-50%,-50%)] gap-3 overflow-auto rounded-none bg-media-popover p-5 text-media-popover-foreground not-data-open:hidden',
          'data-[scope=document]:fixed data-[scope=document]:max-h-[calc(100dvh-var(--media-spacing)*8)]',
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-media-ring',
          'media-high-contrast:border media-high-contrast:border-solid media-high-contrast:border-current forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]'
        )}
      >
        {/* The ruler of the player with the pin past its last tick: this moment is not on it (as on the 404 page). */}
        <div className="signal-error-ruler" aria-hidden="true">
          <span className="signal-error-ticks" />
          <span className="signal-error-pin" />
        </div>
        <div className="flex items-start gap-3">
          <AlertIcon className="mt-0.5 size-6 shrink-0" />
          {/* What is read first is the lead; Video.js's own title ("Something went wrong") stays as the dialog's accessible name. */}
          <span className="signal-error-lead" aria-hidden="true">
            {copy.errorLead}
          </span>
          <ErrorDialogPrimitive.Title className="signal-sr" />
        </div>
        <ErrorDialogPrimitive.Description className={'text-[calc(var(--media-spacing)*3.5)]'}>
          <ErrorText />
        </ErrorDialogPrimitive.Description>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          {/* Retry first: it is the useful next step. Closing the message does not recover the source. */}
          <button
            type="button"
            onClick={retry}
            className={cn(BUTTON, 'bg-white text-black hover:bg-black hover:text-white')}
          >
            {copy.tryAgain}
          </button>
          <ErrorDialogPrimitive.Close
            render={<button type="button" />}
            className={cn(BUTTON, 'bg-black text-white hover:bg-white hover:text-black')}
          />
        </div>
      </ErrorDialogPrimitive.Popup>
    </ErrorDialogPrimitive.Root>
  );
}
