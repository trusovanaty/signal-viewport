/** @jsxImportSource react */

'use client';

import '../styles/video/scaffold.css';
import '../styles/fonts.css';
import '../styles/signal.css';
import { Container as ContainerPrimitive, Poster as PosterPrimitive, Slider as SliderPrimitive } from '@videojs/react';
import type { ReactNode } from 'react';

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

export function VideoSkin({ children, className, renderPoster, resumeKey, themeSwitch, ...props }: VideoSkinProps = {}) {
  const theme = useSignalTheme();
  return (
    <ContainerPrimitive
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
