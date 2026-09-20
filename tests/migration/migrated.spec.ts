import { expect, test } from '@playwright/test';

test('MIG-001 displays the product catalog', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('article')).toHaveCount(2);
});

test('MIG-002 completes checkout with observable network synchronization', async ({ page }) => {
  await page.goto('/');
  const orderResponse = page.waitForResponse(
    (response) => response.url().endsWith('/api/orders') && response.status() === 201,
  );
  await page.getByRole('button', { name: 'Buy now' }).first().click();
  await orderResponse;
  await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
  await page.screenshot({
    path: 'evidence/migration/screenshots/migrated-checkout.png',
    fullPage: true,
  });
});

test('MIG-003 validates the products API contract', async ({ request }) => {
  const response = await request.get('/api/products');
  expect(response.status()).toBe(200);
  const body = (await response.json()) as { products: Array<{ id: string; price: number }> };
  expect(body.products).toHaveLength(2);
  expect(body.products.every((product) => product.id && product.price > 0)).toBe(true);
});
