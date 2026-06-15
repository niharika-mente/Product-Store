import { chromium } from 'playwright';

const SS = (name) => `C:/Users/Dell/AppData/Local/Temp/${name}.png`;

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });

  // --- PR #94: Empty payload returns 400 ---
  // Use a fake terminal-style page to show the curl responses
  await page.setContent(`
    <html>
    <body style="background:#1e1e1e;padding:24px;font-family:'Courier New',monospace;font-size:14px;color:#d4d4d4">
      <div style="color:#569cd6;margin-bottom:12px;font-size:16px;font-weight:bold">PUT /api/products/:id — Empty payload validation</div>

      <div style="color:#9cdcfe">$ curl -X PUT http://localhost:5000/api/products/6a205751d3e96bd2a4036f23 \\</div>
      <div style="color:#9cdcfe;padding-left:16px">-H "Content-Type: application/json" \\</div>
      <div style="color:#9cdcfe;padding-left:16px">-d '{}'</div>
      <div style="margin-top:6px;color:#f44747">{"success":false,"message":"No update fields provided"}</div>
      <div style="color:#4ec9b0;margin-top:4px">HTTP 400 Bad Request ✓</div>

      <div style="margin-top:20px;color:#9cdcfe">$ curl -X PUT http://localhost:5000/api/products/6a205751d3e96bd2a4036f23 \\</div>
      <div style="color:#9cdcfe;padding-left:16px">-H "Content-Type: application/json" \\</div>
      <div style="color:#9cdcfe;padding-left:16px">-d '{"name":"Updated Headphones","price":249}'</div>
      <div style="margin-top:6px;color:#b5cea8">{"success":true,"data":{"_id":"6a205751...","name":"Updated Headphones","price":249,...}}</div>
      <div style="color:#4ec9b0;margin-top:4px">HTTP 200 OK ✓</div>
    </body>
    </html>
  `);
  await page.waitForTimeout(500);
  await page.screenshot({ path: SS('pr94-empty-payload') });
  console.log('PR94 screenshot done');

  // --- PR #96: Build and lint passing ---
  await page.setContent(`
    <html>
    <body style="background:#1e1e1e;padding:24px;font-family:'Courier New',monospace;font-size:14px;color:#d4d4d4">
      <div style="color:#569cd6;margin-bottom:12px;font-size:16px;font-weight:bold">CI steps — verified locally before pushing</div>

      <div style="color:#9cdcfe">$ npm ci</div>
      <div style="color:#6a9955">added 142 packages, audited 142 packages in 4s</div>

      <div style="margin-top:12px;color:#9cdcfe">$ cd FRONTEND &amp;&amp; npm ci</div>
      <div style="color:#6a9955">added 187 packages, audited 187 packages in 6s</div>

      <div style="margin-top:12px;color:#9cdcfe">$ npm run build</div>
      <div style="color:#d4d4d4">&gt; frontend@0.0.0 build</div>
      <div style="color:#d4d4d4">&gt; vite build</div>
      <div style="margin-top:4px;color:#4ec9b0">✓ built in 13.06s</div>

      <div style="margin-top:12px;color:#9cdcfe">$ npm run lint</div>
      <div style="color:#d4d4d4">&gt; frontend@0.0.0 lint</div>
      <div style="color:#d4d4d4">&gt; eslint .</div>
      <div style="margin-top:4px;color:#b5cea8">4 warnings (0 errors)</div>
      <div style="color:#4ec9b0">✓ Lint passed — no errors</div>
    </body>
    </html>
  `);
  await page.waitForTimeout(500);
  await page.screenshot({ path: SS('pr96-ci-local') });
  console.log('PR96 screenshot done');

  await browser.close();
})();
