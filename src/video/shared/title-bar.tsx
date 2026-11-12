/** @jsxImportSource react */

import { Title } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';

import { formatTime } from '../format';
import { useCopy } from '../i18n';
import { AlertIcon } from './icons';
import { useResumeNotice } from './resume';

/**
 * The shell's top strip: title on the left; current chapter (if the source has chapters) and a status word on the right.
 * Right after a saved position is restored, the status word is replaced for a few seconds by "Resumed 0:47" (and the same
 * sentence goes to screen readers). An error is marked by an icon as well as the word, never by color alone.
 */
export function TitleBar() {
  const cues = usePlayer((s) => s.chaptersCues);
  const currentTime = usePlayer((s) => s.currentTime);
  const paused = usePlayer((s) => s.paused);
  const ended = usePlayer((s) => s.ended);
  const started = usePlayer((s) => s.started);
  const waiting = usePlayer((s) => s.waiting);
  const error = usePlayer((s) => s.error);
  const copy = useCopy();
  const resumed = useResumeNotice();

  const chapter = cues?.find((cue) => currentTime >= cue.startTime && currentTime < cue.endTime)?.text;

  // The notice only makes sense while the video is still waiting at the restored position.
  const notice = resumed && paused && !error && !ended ? copy.resumedText(formatTime(resumed.seconds)) : null;

  let status = copy.paused;
  if (error) status = copy.error;
  else if (ended) status = copy.ended;
  else if (notice) status = notice;
  else if (!started) status = copy.ready;
  else if (waiting && !paused) status = copy.buffering;
  else if (!paused) status = copy.playing;

  return (
    <div className="signal-bar">
      <Title className="signal-title" />
      <div className="signal-bar-meta" data-notice={notice ? '' : undefined}>
        {chapter ? <span className="signal-chapter">{chapter}</span> : null}
        {/* Decorative: the status announcer already speaks every state change. */}
        <span className="signal-status" aria-hidden="true">
          {error ? <AlertIcon className="signal-status-icon" /> : null}
          {status}
        </span>
      </div>
      {/* The notice is not a playback state change, so the player's own announcer does not speak it. */}
      <span className="signal-sr" role="status">
        {notice}
      </span>
    </div>
  );
}
