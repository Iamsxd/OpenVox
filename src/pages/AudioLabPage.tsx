import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { Seo } from '../components/Seo';
import { useI18n } from '../i18n/I18nContext';
import { proText } from '../i18n/proTranslations';
import { loadProAudioLab } from '../proLabLoader';

declare global {
  interface Window {
    openOpenVoxProLab?: (tab?: string) => void;
  }
}

export function AudioLabPage() {
  const { language } = useI18n();
  const x = (key: string) => proText(language, key);
  const [ready, setReady] = useState(Boolean(window.openOpenVoxProLab));
  useEffect(() => {
    let active = true;
    const labRoot = () => document.getElementById('openvox-pro-lab-host')?.shadowRoot;
    const removeGlobalLauncher = () => labRoot()?.getElementById('ovxpro-fab')?.remove();
    const syncLabLanguage = () => {
      const select = labRoot()?.getElementById('ovxpro-language') as HTMLSelectElement | null;
      if (!select || select.value === language) return;
      select.value = language;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    };

    removeGlobalLauncher();
    syncLabLanguage();
    void loadProAudioLab()
      .then(() => {
        removeGlobalLauncher();
        syncLabLanguage();
        if (active) setReady(Boolean(window.openOpenVoxProLab));
      })
      .catch((error) => console.error('OpenVox Pro Audio Lab failed to initialize.', error));

    return () => {
      active = false;
    };
  }, [language]);
  const open = (tab = 'input') => window.openOpenVoxProLab?.(tab);
  return (
    <div className="page">
      <Seo
        title={x('lab.title')}
        description={x('lab.body')}
        path="/audio-lab"
      />
      <div className="page-header">
        <div className="page-title-wrap">
          <div className="eyebrow">{x('lab.eyebrow')}</div>
          <h1>{x('lab.title')}</h1>
          <p>{x('lab.body')}</p>
        </div>
        <button className="button button-primary" disabled={!ready} onClick={() => open('input')}>
          <Icon name="settings" />
          {ready ? x('lab.open') : x('lab.loading')}
        </button>
      </div>
      <div className="feature-grid audio-lab-grid">
        {(['input', 'dsp', 'instruments', 'visual', 'offline', 'presets', 'diagnostics'] as const).map((tab) => (
          <article className="feature-card card" key={tab}>
            <div className="feature-icon">
              <Icon name={tab === 'visual' ? 'chart' : tab === 'instruments' ? 'music' : 'settings'} />
            </div>
            <h2>{x(`lab.${tab}.title`)}</h2>
            <p>{x(`lab.${tab}.body`)}</p>
            <button className="mini-button" disabled={!ready} onClick={() => open(tab)}>
              {x('lab.openTool')}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
