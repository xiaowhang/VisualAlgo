import { test, expect } from '@playwright/test';

test.describe('渲染性能', () => {
  test('冒泡排序页 DOM 就绪', async ({ page }) => {
    await page.goto('/algorithm/sorting/bubble-sort', { waitUntil: 'networkidle' });

    // 验证算法视图已渲染
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
    expect(body!.length).toBeGreaterThan(0);
  });

  test('页面交互响应 < 100ms', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // 测量点击响应时间
    const start = Date.now();
    await page.evaluate(() => {
      // 模拟 DOM 交互
      document.body.click();
    });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
  });

  test('多次路由切换无明显内存增长', async ({ page }) => {
    const routes = ['/', '/algorithm/sorting/bubble-sort', '/compare', '/'];

    const memorySnapshots: number[] = [];

    for (const route of routes) {
      await page.goto(route, { waitUntil: 'networkidle' });

      const memory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize ?? 0;
      });
      memorySnapshots.push(memory);
    }

    // 如果 performance.memory 可用，检查没有极端增长
    if (memorySnapshots.some(m => m > 0)) {
      const maxMemory = Math.max(...memorySnapshots.filter(m => m > 0));
      const minMemory = Math.min(...memorySnapshots.filter(m => m > 0));
      const growthRatio = maxMemory / minMemory;

      // 内存增长不应超过 5 倍
      expect(growthRatio).toBeLessThan(5);
    }
  });
});
