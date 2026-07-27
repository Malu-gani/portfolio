import { test, expect } from '@playwright/test';

test('la home en español responde y renderiza el título', async ({ page }) => {
  await page.goto('/es/');
  await expect(page.getByTestId('hero')).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();
});
