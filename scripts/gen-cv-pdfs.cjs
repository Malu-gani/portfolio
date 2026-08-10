// Genera public/cv/cv-es.pdf y public/cv/cv-en.pdf a partir de scripts/cv/*.html
// usando Chromium (via Playwright, ya presente como devDependency del proyecto).
const path = require('path');
const fs = require('fs');
const { chromium } = require('@playwright/test');

const outDir = path.join(__dirname, '..', 'public', 'cv');
fs.mkdirSync(outDir, { recursive: true });

const paginas = [
  { html: 'cv-es.html', pdf: 'cv-es.pdf' },
  { html: 'cv-en.html', pdf: 'cv-en.pdf' },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const { html, pdf } of paginas) {
    const htmlPath = path.join(__dirname, 'cv', html);
    await page.goto('file://' + htmlPath.replace(/\\/g, '/'));
    await page.pdf({
      path: path.join(outDir, pdf),
      format: 'Letter',
      printBackground: true,
    });
    console.log('Generado', pdf);
  }

  await browser.close();
})();
