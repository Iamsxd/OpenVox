import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { defaultSettings } from '../src/app/AppContext';

describe('privacy defaults', () => {
  it('ships without Google Analytics or an analytics preference', () => {
    const html = readFileSync(resolve('index.html'), 'utf8');
    expect(defaultSettings).not.toHaveProperty('analyticsEnabled');
    expect(html).not.toMatch(/googletagmanager\.com|google-analytics\.com|G-6LN7QL6SP2/i);
  });
});
