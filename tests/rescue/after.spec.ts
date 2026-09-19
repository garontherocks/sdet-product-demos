import { expect, test } from '@playwright/test';

test('rescued checkout waits for observable readiness', async ({ page }) => {
  const run = Number(process.env.DEMO_RUN_INDEX ?? '1');
  const renderDelay = run === 2 ? 350 : 20;
  await page.goto(`/?renderDelay=${renderDelay}`);
  await expect(page.getByRole('button', { name: 'Buy now' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Buy now' }).first().click();
  await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
  if (run === 1) {
    await page.screenshot({
      path: 'evidence/rescue/screenshots/rescued-checkout.png',
      fullPage: true,
    });
  }
});
