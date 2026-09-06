import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { defaultSettings } from '../src/app/AppContext';

describe('privacy defaults', () => {
  it('ships without Google Analytics or an analytics preference', () => {
    const html = readFileSync(resolve('index.html'), 'utf8');
    expect(defaultSettings).not.toHaveProperty('analyticsEnabled');
    expect(html).not.toMatch(/googletagmanager\.com|google-analytics\.com|G-6LN7QL6SP2/i);
  });

  it('ships without account, authentication, or synchronization features', () => {
    const appSource = [
      readFileSync(resolve('src/main.tsx'), 'utf8'),
      readFileSync(resolve('src/app/App.tsx'), 'utf8'),
      readFileSync(resolve('src/components/AppShell.tsx'), 'utf8'),
    ].join('\n');

    expect(appSource).not.toMatch(/AuthProvider|AccountPage|\/account/);
    expect(existsSync(resolve('src/core/auth/authApi.ts'))).toBe(false);
    expect(existsSync(resolve('src/core/sync/trainingSync.ts'))).toBe(false);
    expect(existsSync(resolve('server/package.json'))).toBe(false);
  });
});
