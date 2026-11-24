// Renders the channel art HTML templates to PNG with Playwright.
// Usage: node render.js [outDir]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const src = __dirname;
const out = path.resolve(process.argv[2] || path.join(src, '..'));
const mascot = fs.readFileSync(path.join(src, 'mascot.svg'), 'utf8');

const jobs = [
  { file: 'profile.html', png: 'profile-picture-800.png', w: 800, h: 800 },
  { file: 'banner.html', png: 'banner-2560x1440.png', w: 2560, h: 1440 },
  { file: 'watermark.html', png: 'watermark-150.png', w: 150, h: 150, transparent: true },
  { file: 'mascot.html', png: 'mascot-kofa.png', w: 1000, h: 1050, transparent: true },
];

(async () => {
  const browser = await chromium.launch();
  for (const j of jobs) {
    const html = fs.readFileSync(path.join(src, j.file), 'utf8').replaceAll('{{MASCOT}}', mascot);
    const page = await browser.newPage({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(out, j.png), omitBackground: !!j.transparent });
    await page.close();
    console.log('wrote', j.png);
  }
  await browser.close();
})();
