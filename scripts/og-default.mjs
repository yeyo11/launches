// Draws the share image of the pages that have no launch image of their own (the home pages, about,
// privacy): public/og-default-<lang>.png, 1200×630, in the site's identity. Run it after changing
// the tagline or the look: node scripts/og-default.mjs (needs Google Chrome or Chromium on PATH, or
// CHROME=/path/to/chrome).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const font = (file) => `file://${join(root, 'node_modules/@fontsource-variable', file)}`;
const chrome = process.env.CHROME ?? 'google-chrome';
const TAGLINE = {
  en: 'Open-source tools I build, told the day they ship.',
  es: 'Herramientas open source que construyo, contadas el día que salen.',
};
const COLOURS = ['#2FD7A0', '#FFD43B', '#FF6FAE', '#FF7A2F', '#7C8CFF', '#3B4BF0'];

const page = (lang) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
@font-face { font-family: Fraunces; font-weight: 100 900; src: url('${font('fraunces/files/fraunces-latin-full-normal.woff2')}'); }
@font-face { font-family: Fraunces; font-style: italic; font-weight: 100 900; src: url('${font('fraunces/files/fraunces-latin-full-italic.woff2')}'); }
@font-face { font-family: Sans; font-weight: 100 900; src: url('${font('instrument-sans/files/instrument-sans-latin-wght-normal.woff2')}'); }
@font-face { font-family: Mono; font-weight: 100 900; src: url('${font('jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2')}'); }
html, body { margin: 0; width: 1200px; height: 630px; background: #000; color: #F5F2EA; overflow: hidden; }
main { box-sizing: border-box; height: 630px; padding: 84px 88px 0; display: flex; flex-direction: column; }
h1 { margin: 0; font: 400 148px/1 Fraunces; font-variation-settings: 'opsz' 144, 'SOFT' 30; letter-spacing: -0.01em; }
.sw { font-style: italic; font-variation-settings: 'opsz' 144, 'WONK' 1, 'SOFT' 100; }
p { margin: 34px 0 0; max-width: 900px; font: 400 40px/1.3 Sans; color: #B8B4AA; }
.url { margin-top: auto; padding-bottom: 46px; font: 500 26px Mono; color: #F5F2EA; }
.bar { display: flex; height: 22px; }
.bar i { flex: 1; }
</style></head><body><main>
<h1><span class="sw">J</span>osé <span class="sw">G</span>arrido</h1>
<p>${TAGLINE[lang]}</p>
<div class="url">josegarrido.dev</div>
</main><div class="bar" style="position:absolute;left:0;right:0;bottom:0">${COLOURS.map((c) => `<i style="background:${c}"></i>`).join('')}</div></body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'og-'));
try {
  for (const lang of Object.keys(TAGLINE)) {
    const html = join(dir, `${lang}.html`);
    const shot = join(dir, `${lang}.png`);
    writeFileSync(html, page(lang));
    execFileSync(chrome, ['--headless=new', '--no-sandbox', '--hide-scrollbars', '--allow-file-access-from-files', '--force-device-scale-factor=1', '--window-size=1200,630', '--virtual-time-budget=3000', `--screenshot=${shot}`, `file://${html}`], { stdio: 'ignore' });
    await sharp(shot).png({ palette: true, quality: 90, effort: 10 }).toFile(join(root, 'public', `og-default-${lang}.png`));
    console.log(`public/og-default-${lang}.png`);
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
