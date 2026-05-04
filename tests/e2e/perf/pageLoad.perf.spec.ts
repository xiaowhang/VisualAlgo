import { test, expect } from '@playwright/test';

test.describe('页面加载性能', () => {
  test('首页加载 < 3s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(3000);
  });

  test('冒泡排序页首次渲染 < 5s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/algorithm/sorting/bubble-sort', { waitUntil: 'networkidle' });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5000);
  });

  test('路由切换：首页→算法页 < 3s', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const start = Date.now();
    await page.goto('/algorithm/sorting/bubble-sort', { waitUntil: 'networkidle' });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(3000);
  });

  test('对比页加载 < 5s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/compare', { waitUntil: 'networkidle' });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5000);
  });
});
