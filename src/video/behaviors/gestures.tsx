/** @jsxImportSource react */

import { Gesture } from '@videojs/react';

export interface VideoGesturesProps {
  disabled?: boolean | undefined;
}

export function VideoGestures({ disabled = false }: VideoGesturesProps = {}) {
  return (
    <>
      <Gesture disabled={disabled} type="tap" action="togglePaused" pointer="mouse" region="center" />
      {/* A tap with a finger pauses and resumes, anywhere on the picture, in the page and in full screen (the panel is always
          visible, so "show or hide the controls" would do nothing). A double tap still seeks or toggles full screen. */}
      <Gesture disabled={disabled} type="tap" action="togglePaused" pointer="touch" />
      <Gesture disabled={disabled} type="doubletap" action="seekStep" region="left" />
      <Gesture disabled={disabled} type="doubletap" action="toggleFullscreen" region="center" />
      <Gesture disabled={disabled} type="doubletap" action="seekStep" region="right" />
    </>
  );
}
