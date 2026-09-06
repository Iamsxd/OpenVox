import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';
import { useI18n } from '../i18n/I18nContext';
import { proText } from '../i18n/proTranslations';

export function LandingPage() {
  const { t, language } = useI18n();
  const x = (key: string) => proText(language, key);
  const primaryTools = [
    ['mic', 'nav.studio', 'home.pitchBody', '/studio'],
    ['music', 'nav.practice', 'home.practiceBody', '/practice'],
    ['spark', 'nav.academy', 'landing.academyBody', '/academy'],
    ['chart', 'nav.analyze', 'home.analyzeBody', '/analyze'],
  ] as const;
  const moreTools = [
    ['wave', 'nav.transcribe', '/transcribe'],
    ['score', 'nav.score', '/score'],
    ['music', 'nav.instruments', '/instruments'],
    ['wave', 'nav.trackLab', '/track-lab'],
    ['settings', 'nav.mixer', '/mixer'],
    ['users', 'nav.choir', '/choir'],
    ['settings', 'nav.audioLab', '/audio-lab'],
    ['chart', 'nav.progress', '/progress'],
    ['folder', 'nav.projects', '/projects'],
  ] as const;
  const wave = [26, 44, 66, 38, 74, 92, 56, 32, 68, 84, 48, 28, 58, 78, 46, 64, 34, 52];

  return (
    <div className="page home-page">
      <Seo
        title={t('hero.title')}
        description={t('hero.body')}
        path="/"
      />
      <section className="home-hero">
        <div className="home-intro">
          <div className="eyebrow">{t('hero.eyebrow')}</div>
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.body')}</p>
          <div className="home-actions">
            <Link className="button button-primary" to="/studio">
              <Icon name="mic" />
              {t('hero.open')}
            </Link>
            <Link className="button" to="/practice">
              <Icon name="music" />
              {t('nav.practice')}
            </Link>
          </div>
          <ul className="home-trust-list" aria-label={t('home.privacySummary')}>
            <li>
              <Icon name="shield" />
              {t('home.onDevice')}
            </li>
            <li>
              <Icon name="folder" />
              {t('home.noAccount')}
            </li>
            <li>
              <Icon name="spark" />
              {t('home.noAnalytics')}
            </li>
          </ul>
        </div>
        <div className="home-signal-console" aria-label={t('home.signalPreview')}>
          <div className="home-signal-header">
            <span>{t('home.signalPreview')}</span>
            <span className="home-local-status">
              <i /> {t('home.localStatus')}
            </span>
          </div>
          <div className="home-signal-main">
            <div className="home-note-lockup">
              <strong>A4</strong>
              <span>440.00 Hz</span>
            </div>
            <div className="home-wave" aria-hidden="true">
              {wave.map((height, index) => (
                <span key={`${height}-${index}`} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
          <div className="home-signal-metrics">
            <div>
              <span>{t('home.detectedPitch')}</span>
              <strong>A4</strong>
            </div>
            <div>
              <span>{t('home.tuning')}</span>
              <strong>+0 ct</strong>
            </div>
            <div>
              <span>{t('home.confidence')}</span>
              <strong>98%</strong>
            </div>
          </div>
        </div>
      </section>
      <section className="home-section" aria-labelledby="home-start-title">
        <div className="home-section-heading">
          <div>
            <div className="eyebrow">{t('home.workspaceEyebrow')}</div>
            <h2 id="home-start-title">{t('home.startTitle')}</h2>
          </div>
          <p>{t('home.startBody')}</p>
        </div>
        <div className="home-primary-grid">
          {primaryTools.map(([icon, title, body, path], index) => (
            <Link className="home-action-card" to={path} key={title}>
              <span className="home-card-index">0{index + 1}</span>
              <div className="home-action-icon">
                <Icon name={icon} />
              </div>
              <div>
                <h3>{t(title)}</h3>
                <p>{body.startsWith('home.') ? t(body) : x(body)}</p>
              </div>
              <span className="home-card-arrow" aria-hidden="true">
                <Icon name="chevron" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="home-section home-tools-section" aria-labelledby="home-tools-title">
        <div className="home-section-heading">
          <div>
            <div className="eyebrow">{t('home.toolsEyebrow')}</div>
            <h2 id="home-tools-title">{t('home.toolsTitle')}</h2>
          </div>
          <p>{t('home.toolsBody')}</p>
        </div>
        <div className="home-tools-grid">
          {moreTools.map(([icon, title, path]) => (
            <Link to={path} key={title}>
              <span>
                <Icon name={icon} />
              </span>
              <strong>{t(title)}</strong>
              <Icon name="chevron" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
