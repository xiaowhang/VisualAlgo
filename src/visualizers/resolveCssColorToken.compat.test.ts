import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveCssColorToken } from './resolveCssColorToken';

function createMockSvg(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  return svg as SVGSVGElement;
}

describe('resolveCssColorToken 兼容性', () => {
  let svg: SVGSVGElement;

  beforeEach(() => {
    svg = createMockSvg();
    document.body.appendChild(svg);
  });

  describe('oklch-to-rgb 转换', () => {
    it('oklch(0 0 0) → rgb(0, 0, 0) 纯黑', () => {
      const result = resolveCssColorToken(svg, 'oklch(0 0 0)');
      expect(result).toBe('rgb(0, 0, 0)');
    });

    it('oklch(1 0 0) → rgb(255, 255, 255) 纯白', () => {
      const result = resolveCssColorToken(svg, 'oklch(1 0 0)');
      expect(result).toBe('rgb(255, 255, 255)');
    });

    it('oklch(0.5 0 120) 零彩度产生灰色', () => {
      const result = resolveCssColorToken(svg, 'oklch(0.5 0 120)');
      const match = result.match(/rgb\((\d+), (\d+), (\d+)\)/);
      expect(match).not.toBeNull();
      const [, r, g, b] = match!.map(Number);
      expect(Math.abs(r - g)).toBeLessThan(5);
      expect(Math.abs(g - b)).toBeLessThan(5);
    });

    it('oklch(50% 0.1 120) 百分比 L 值', () => {
      const result = resolveCssColorToken(svg, 'oklch(50% 0.1 120)');
      expect(result).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });

    it('oklch(0.5 0.2 180 / 0.5) 带 alpha 产生 rgba', () => {
      const result = resolveCssColorToken(svg, 'oklch(0.5 0.2 180 / 0.5)');
      expect(result).toMatch(/^rgba\(\d+, \d+, \d+, 0\.5\)$/);
    });

    it('oklch(0.5 0.2 180 / 50%) 百分比 alpha', () => {
      const result = resolveCssColorToken(svg, 'oklch(0.5 0.2 180 / 50%)');
      expect(result).toMatch(/^rgba\(\d+, \d+, \d+, 0\.5\)$/);
    });

    it('alpha=1 时不产生 rgba', () => {
      const result = resolveCssColorToken(svg, 'oklch(0.5 0.2 180 / 1)');
      expect(result).toMatch(/^rgb\(/);
      expect(result).not.toMatch(/^rgba\(/);
    });

    it('alpha 缺省时为 rgb 格式', () => {
      const result = resolveCssColorToken(svg, 'oklch(0.5 0.2 180)');
      expect(result).toMatch(/^rgb\(/);
    });

    it('大小写不敏感 OKLCH()', () => {
      const result = resolveCssColorToken(svg, 'OKLCH(0.5 0.2 180)');
      expect(result).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });

    it('各色相 H=0/60/120/180/240/300 产生不同颜色', () => {
      const hues = [0, 60, 120, 180, 240, 300];
      const results = hues.map(h => resolveCssColorToken(svg, `oklch(0.7 0.15 ${h})`));
      const unique = new Set(results);
      expect(unique.size).toBe(6);
    });

    it('极端 L 值不溢出', () => {
      const dark = resolveCssColorToken(svg, 'oklch(0.01 0 0)');
      const bright = resolveCssColorToken(svg, 'oklch(0.99 0 0)');
      expect(dark).toMatch(/^rgb\(/);
      expect(bright).toMatch(/^rgb\(/);
    });

    it('oklch 无空格格式', () => {
      const result = resolveCssColorToken(svg, 'oklch(0.5 0.2 180)');
      expect(result).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });

    it('oklch 多空格格式', () => {
      const result = resolveCssColorToken(svg, 'oklch(  0.5   0.2   180  )');
      expect(result).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });
  });

  describe('非 oklch 格式处理', () => {
    it('非法格式返回原始字符串', () => {
      const result = resolveCssColorToken(svg, 'not-a-color');
      expect(result).toBe('not-a-color');
    });

    it('已有的 rgb 格式直接返回', () => {
      const result = resolveCssColorToken(svg, 'rgb(100, 200, 50)');
      expect(result).toBe('rgb(100, 200, 50)');
    });

    it('已有的 rgba 格式直接返回', () => {
      const result = resolveCssColorToken(svg, 'rgba(100, 200, 50, 0.5)');
      expect(result).toBe('rgba(100, 200, 50, 0.5)');
    });
  });

  describe('var() 引用解析', () => {
    it('var() 引用通过 getComputedStyle 解析', () => {
      const mockGetComputed = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        getPropertyValue: (name: string) => (name === '--test-color' ? 'rgb(10, 20, 30)' : ''),
      } as unknown as CSSStyleDeclaration);

      const result = resolveCssColorToken(svg, 'var(--test-color)');
      expect(result).toBe('rgb(10, 20, 30)');

      mockGetComputed.mockRestore();
    });

    it('getComputedStyle 返回空时 fallback', () => {
      const mockGetComputed = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        getPropertyValue: () => '',
        color: '',
      } as unknown as CSSStyleDeclaration);

      const result = resolveCssColorToken(svg, 'var(--nonexistent)');
      expect(result).toBe('var(--nonexistent)');

      mockGetComputed.mockRestore();
    });
  });
});
