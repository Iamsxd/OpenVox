import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../src/app/App';
import { AppProvider } from '../src/app/AppContext';
import { AuthProvider } from '../src/app/AuthContext';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('openvox.language', 'en');
  localStorage.setItem('openvox.theme', 'system');
});

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppProvider>
    </MemoryRouter>,
  );
}

describe('OpenVox application shell', () => {
  const routes = [
    ['/', 'Your voice. Understood.'],
    ['/studio', 'Live Voice Studio'],
    ['/practice', 'Practice Studio'],
    ['/academy', 'Train the whole instrument.'],
    ['/instruments', 'Tune. Reference. Rehearse.'],
    ['/track-lab', 'Rehearse the passage, not the whole song.'],
    ['/mixer', 'Build the rehearsal. Mix the take.'],
    ['/audio-lab', 'Shape and inspect the signal.'],
    ['/progress', 'Practice that leaves a trace.'],
    ['/transcribe', 'Voice to Score'],
    ['/analyze', 'Vocal Analysis'],
    ['/score', 'Score Editor'],
    ['/choir', 'Choir Studio'],
    ['/projects', 'Local Projects'],
    ['/settings', 'Settings'],
    ['/account', 'Your OpenVox account'],
    ['/privacy', 'Privacy'],
  ] as const;

  for (const [path, heading] of routes) {
    it(`renders ${path}`, async () => {
      renderRoute(path);
      expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeTruthy();
    });
  }

  it('switches the interface language without reloading', async () => {
    const user = userEvent.setup();
    renderRoute('/settings');

    await screen.findByRole('heading', { level: 1, name: 'Settings' });
    await user.click(screen.getByRole('button', { name: 'UK' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Налаштування' })).toBeTruthy();
    await waitFor(() => expect(document.documentElement.lang).toBe('uk'));
  });

  it('switches the complete interface to Simplified Chinese', async () => {
    const user = userEvent.setup();
    renderRoute('/settings');

    await user.click(screen.getByRole('button', { name: 'ZH' }));

    expect(await screen.findByRole('heading', { level: 1, name: '设置' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: '界面' })).toBeTruthy();
    await waitFor(() => expect(document.documentElement.lang).toBe('zh'));
  });

  it('renders every route heading and eyebrow in Simplified Chinese', async () => {
    localStorage.setItem('openvox.language', 'zh');
    const chineseRoutes = [
      ['/', '听懂你的声音。', '隐私保护 · 本地优先 · 开源'],
      ['/studio', '实时声乐工作室', '核心声音分析'],
      ['/practice', '练习工作室', '声乐练习'],
      ['/academy', '全面训练你的发声系统。', 'OpenVox 声乐学院'],
      ['/instruments', '调音、参考、排练。', 'OpenVox 乐器工作室'],
      ['/track-lab', '专练困难段落，不必每次唱完整首歌。', 'OpenVox 伴奏实验室'],
      ['/mixer', '搭建排练，完成混音。', 'OpenVox 本地多轨工作室'],
      ['/audio-lab', '塑造并检查音频信号。', 'OpenVox 专业音频实验室'],
      ['/progress', '让每次练习都有记录。', 'OpenVox 练习进度'],
      ['/transcribe', '声音转乐谱', '本地音频转谱'],
      ['/analyze', '声音分析', '本地声音指标'],
      ['/score', '乐谱编辑器', '乐谱编辑'],
      ['/choir', '合唱工作室', '合唱排练'],
      ['/projects', '本地项目', '本地优先资料库'],
      ['/settings', '设置', '偏好设置'],
      ['/account', '你的 OpenVox 账号', '可选云端同步'],
      ['/privacy', '隐私', '隐私优先'],
    ] as const;

    for (const [path, heading, eyebrow] of chineseRoutes) {
      const view = renderRoute(path);
      expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeTruthy();
      expect(screen.getByText(eyebrow, { selector: '.eyebrow' })).toBeTruthy();
      view.unmount();
    }
  });

  it('falls back to the landing page for unknown routes', async () => {
    renderRoute('/this-route-does-not-exist');
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Your voice. Understood.',
      }),
    ).toBeTruthy();
  });
});

describe('Score editor', () => {
  it('adds a note and renders it in the score preview', async () => {
    const user = userEvent.setup();
    const { container } = renderRoute('/score');

    await screen.findByRole('heading', { level: 1, name: 'Score Editor' });
    expect(container.querySelectorAll('.note-row')).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: /Add note/i }));

    expect(container.querySelectorAll('.note-row')).toHaveLength(1);
    expect(container.querySelector('.score-svg-wrap svg')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(container.querySelectorAll('.note-row')).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Redo' }));
    expect(container.querySelectorAll('.note-row')).toHaveLength(1);
  });
});

describe('Tool-first home and mobile-ready score UI', () => {
  it('opens the primary local workflows without creator or support promotions', async () => {
    const { container } = renderRoute('/');
    await screen.findByRole('heading', {
      level: 1,
      name: 'Your voice. Understood.',
    });
    expect(container.querySelector('.home-primary-grid a[href="/studio"]')).toBeTruthy();
    expect(container.querySelector('.home-primary-grid a[href="/practice"]')).toBeTruthy();
    expect(container.querySelector('.home-primary-grid a[href="/academy"]')).toBeTruthy();
    expect(container.querySelector('.home-primary-grid a[href="/analyze"]')).toBeTruthy();
    expect(screen.queryByText('Created by AuthorChe')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Support project' })).toBeNull();
  });

  it('provides edit and preview panes plus score zoom controls', async () => {
    renderRoute('/score');
    await screen.findByRole('heading', { level: 1, name: 'Score Editor' });
    expect(screen.getByRole('tab', { name: 'Note' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Visual score' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeTruthy();
  });
});
