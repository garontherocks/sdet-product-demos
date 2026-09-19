import { expect, test } from '@playwright/test';

test('rescued checkout waits for observable readiness', async ({ page }) => {
  const run = Number(process.env.DEMO_RUN_INDEX ?? '1');
  const renderDelay = run === 2 ? 350 : 20;
  await page.goto(`/rescue.html?renderDelay=${renderDelay}`);
  const checkout = page.getByRole('button', { name: 'Complete checkout' });
  await expect(checkout).toBeVisible();
  await checkout.click();
  await expect(page.getByText('Order confirmed')).toBeVisible();
  if (run === 1) {
    await page.screenshot({
      path: 'evidence/rescue/screenshots/rescued-checkout.png',
      fullPage: true,
    });
  }
});
