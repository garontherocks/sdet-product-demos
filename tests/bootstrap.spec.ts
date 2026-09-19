import { expect, test } from '@playwright/test';

test.describe('Playwright Automation Bootstrap demo', () => {
  test('customer completes a deterministic checkout', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Quality Lab Store' })).toBeVisible();
    await page.getByRole('button', { name: 'Buy now' }).first().click();
    await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
    await expect(page.getByText('ORDER-1001')).toBeVisible();
    await page.screenshot({
      path: 'evidence/bootstrap/screenshots/checkout-success.png',
      fullPage: true,
    });
  });

  test('API contract exposes deterministic products', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { products: Array<{ id: string; price: number }> };
    expect(body.products).toHaveLength(2);
    expect(body.products[0]).toEqual(expect.objectContaining({ id: 'starter', price: 49 }));
  });

  test('API creates a confirmed order', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: { productId: 'rescue', total: 89 },
    });
    expect(response.status()).toBe(201);
    expect(await response.json()).toEqual({ id: 'ORDER-1001', status: 'confirmed', total: 89 });
  });
});
