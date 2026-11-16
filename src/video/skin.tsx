/** @jsxImportSource react */

'use client';

import '../styles/video/scaffold.css';
import '../styles/fonts.css';
import '../styles/signal.css';
import { Container as ContainerPrimitive, Poster as PosterPrimitive, Slider as SliderPrimitive } from '@videojs/react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { VideoGestures } from './behaviors/gestures';
import { VideoHotkeys } from './behaviors/hotkeys';
import { ErrorDialog } from './shared/error-dialog';
import { Indicators } from './shared/indicators';
import { Preferences, ThemeSwitchContext, useSignalTheme } from './shared/preferences';
import { Resume } from './shared/resume';
import { Panel } from './shared/panel';
import { SeekIndicator } from './shared/seek-indicator';
import { StartButton } from './shared/start-button';
import { StatusAnnouncer } from './shared/status-announcer';
import { TitleBar } from './shared/title-bar';
import { BufferingIndicator, Poster } from './shared/video-feedback';

export interface VideoSkinProps extends Omit<ContainerPrimitive.Props, 'children'> {
  children?: ReactNode;
  renderPoster?: PosterPrimitive.ImageProps['render'];
  /** Kept for API compatibility with the packaged skins; this skin has no thumbnail preview. */
  renderThumbnail?: SliderPrimitive.Thumbnail.ImageProps['render'];
  /** Identifies this video for saved resume positions. Defaults to the video's title; without either, nothing is saved. */
  resumeKey?: string;
  /**
   * Adds a Colour option (Red / Mono) to the settings menu. Off by default: on a real site the colour is the site's
   * choice. The viewer's choice is saved with the other preferences.
   */
  themeSwitch?: boolean;
}

/**
 * A click on the picture (or any plain part of the player) leaves the focus on the page, so the keyboard shortcuts (M, K,
 * J, L, F, C, arrows) would do nothing until a button was clicked. Move the focus to the player itself instead. Controls
 * keep their own focus.
 */
function focusPlayerOnPointer(event: ReactMouseEvent<HTMLElement>) {
  const root = event.currentTarget;
  // After the click has been handled: a plain part of the picture never takes the focus, and the big start button
  // disappears when the video starts. In both cases the focus would be left on the page, so give it to the player.
  window.setTimeout(() => {
    const active = document.activeElement;
    if (!active || active === document.body || !root.contains(active)) {
      if (root.isConnected) root.focus({ preventScroll: true });
    }
  }, 120);
}

/**
 * The shortcuts are letters (M, K, J, L, C, I, F) and the two speed keys (< and >). The library matches the typed
 * character, so on a Ukrainian or Russian layout (M is "ь", K is "л") none of them would work, while Space and the arrows
 * would. The physical key is the same on every layout, so a key that is not an ASCII character is repeated with the Latin
 * letter of the same physical key, and the library handles it as usual.
 */
function latinKeyFor(event: ReactKeyboardEvent<HTMLElement>): string | null {
  if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1 || event.key.charCodeAt(0) < 128) return null;
  const letter = /^Key([A-Z])$/.exec(event.code);
  if (letter) return event.shiftKey ? letter[1]! : letter[1]!.toLowerCase();
  if (event.shiftKey && event.code === 'Comma') return '<';
  if (event.shiftKey && event.code === 'Period') return '>';
  return null;
}

function repeatWithLatinKey(event: ReactKeyboardEvent<HTMLElement>): boolean {
  const target = event.target as HTMLElement;
  if (target.closest('input, textarea, [contenteditable="true"]')) return false;
  const key = latinKeyFor(event);
  if (!key) return false;
  event.preventDefault();
  event.stopPropagation();
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, code: event.code, shiftKey: event.shiftKey, repeat: event.repeat, bubbles: true, cancelable: true })
  );
  return true;
}

/** S opens the settings menu from anywhere in the player (the menu itself uses the letters to pick rows, so it is left alone). */
function openMenuOnS(event: ReactKeyboardEvent<HTMLElement>) {
  if (event.key !== 's' && event.key !== 'S') return;
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
  const target = event.target as HTMLElement;
  if (target.closest('input, textarea, [contenteditable="true"], .signal-menu')) return;
  const button = event.currentTarget.querySelector<HTMLElement>('.signal-btn--menu');
  if (!button) return;
  event.preventDefault();
  button.click();
}

export function VideoSkin({ children, className, renderPoster, resumeKey, themeSwitch, onClick, onKeyDownCapture, ...props }: VideoSkinProps = {}) {
  const theme = useSignalTheme();
  return (
    <ContainerPrimitive
      onKeyDownCapture={(event: ReactKeyboardEvent<HTMLElement>) => {
        if (!repeatWithLatinKey(event)) openMenuOnS(event);
        (onKeyDownCapture as ((e: ReactKeyboardEvent<HTMLElement>) => void) | undefined)?.(event);
      }}
      onClick={(event: ReactMouseEvent<HTMLElement>) => {
        focusPlayerOnPointer(event);
        (onClick as ((e: ReactMouseEvent<HTMLElement>) => void) | undefined)?.(event);
      }}
      className={cn(
        'media-skin signal-skin',
        'relative h-full w-full text-media-foreground @container/media-root',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-media-ring',
        className
      )}
      data-theme="scaffold"
      data-preset="video"
      data-signal-theme={themeSwitch && theme === 'mono' ? 'mono' : undefined}
      {...props}
    >
      <ThemeSwitchContext.Provider value={!!themeSwitch}>
      <TitleBar />
      <div className="signal-viewport">
        {children}
        <Poster renderImage={renderPoster} />
        <StartButton />
        <BufferingIndicator className="z-40" />
        <ErrorDialog />
        <Indicators>
          <SeekIndicator />
        </Indicators>
      </div>
      <Panel />

      <Preferences />
      <Resume resumeKey={resumeKey} />
      <VideoHotkeys />
      <VideoGestures />
      <StatusAnnouncer />
      </ThemeSwitchContext.Provider>
    </ContainerPrimitive>
  );
}
