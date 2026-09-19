import { expect, test } from '@playwright/test';

test('legacy checkout depends on a fixed delay', async ({ page }) => {
  const run = Number(process.env.DEMO_RUN_INDEX ?? '1');
  const renderDelay = run === 2 ? 350 : 20;
  await page.goto(`/?renderDelay=${renderDelay}`);
  await page.waitForTimeout(100);
  expect(await page.getByRole('button', { name: 'Buy now' }).first().isVisible()).toBe(true);
});
