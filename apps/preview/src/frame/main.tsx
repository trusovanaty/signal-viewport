import { I18nProvider } from '@videojs/react/i18n';
import { type CSSProperties, StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '@/skin.css';
import './preview.css';
import { playbackProps, playerStyles } from '../shell/params';
import { initialParams, onParamsChange } from './frame';
import { Player } from './player';

// `?theme=mono` shows the skin's mono theme (white panel, black ink), e.g. when this page is embedded on a site.
const THEME = new URLSearchParams(location.search).get('theme') === 'mono' ? 'mono' : undefined;

function Preview() {
  const [params, setParams] = useState(initialParams);

  useEffect(() => onParamsChange(setParams), []);

  return (
    // The provider loads Video.js's built-in translations for the selected language.
    <I18nProvider locale={params.locale}>
      <div className="preview-player" data-theme={THEME} style={playerStyles(params) as CSSProperties}>
        <Player media={playbackProps(params)} />
      </div>
    </I18nProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>
);
