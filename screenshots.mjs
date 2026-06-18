import { chromium } from 'playwright';

const SS = (name) => `C:/Users/Dell/AppData/Local/Temp/pr84-${name}.png`;

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Screenshot 1: Homepage with product cards visible
  await page.screenshot({ path: SS('1-homepage') });
  console.log('Screenshot 1: Homepage');

  // Screenshot 2: Click trash icon → dialog appears
  const trashBtn = page.locator('[aria-label="Delete Product"]').first();
  await trashBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: SS('2-dialog-open') });
  console.log('Screenshot 2: Confirmation dialog open');

  // Screenshot 3: Click Cancel → dialog closes, product still there
  await page.click('button:has-text("Cancel")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: SS('3-after-cancel') });
  console.log('Screenshot 3: After cancel - product still visible');

  // Screenshot 4: Open dialog again → click Delete → success toast
  await trashBtn.click();
  await page.waitForTimeout(800);
  // Click the red Delete button inside the AlertDialog footer
  await page.locator('[role="alertdialog"] button:has-text("Delete")').click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: SS('4-after-delete') });
  console.log('Screenshot 4: After confirm delete - product removed with toast');

  await page.waitForTimeout(2000);
  await browser.close();
})();
