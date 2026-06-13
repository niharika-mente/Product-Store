const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => console.error('PageError:', err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('ConsoleError:', msg.text());
  });
  
  await page.goto('http://localhost:5173', {waitUntil: 'networkidle0'});
  await page.click('button[aria-label="Open cart"]');
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
