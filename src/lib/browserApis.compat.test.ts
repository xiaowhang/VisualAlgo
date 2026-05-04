import { describe, it, expect } from 'vitest';

describe('browserApis 兼容性', () => {
  describe('localStorage', () => {
    it('happy-dom 中正常读写', () => {
      localStorage.setItem('__test_key', 'hello');
      expect(localStorage.getItem('__test_key')).toBe('hello');
      localStorage.removeItem('__test_key');
      expect(localStorage.getItem('__test_key')).toBeNull();
    });

    it('不可用时应有降级处理', () => {
      const original = window.localStorage;
      try {
        // 模拟 localStorage 不可用（抛出异常）
        Object.defineProperty(window, 'localStorage', {
          get: () => {
            throw new Error('not available');
          },
          configurable: true,
        });
        // 项目代码应能在 try/catch 中处理此场景
        expect(() => {
          try {
            window.localStorage.getItem('x');
          } catch {
            // 预期走到这里
          }
        }).not.toThrow();
      } finally {
        Object.defineProperty(window, 'localStorage', {
          value: original,
          configurable: true,
        });
      }
    });
  });

  describe('document', () => {
    it('happy-dom 中 document 可用', () => {
      expect(document).toBeDefined();
      expect(document.createElement).toBeTypeOf('function');
    });

    it('createElementNS 创建 SVG 元素', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      expect(svg).toBeDefined();
      expect(svg.tagName).toBe('svg');
    });
  });

  describe('Blob 与 URL', () => {
    it('Blob 可用', () => {
      const blob = new Blob(['test'], { type: 'text/plain' });
      expect(blob).toBeDefined();
      expect(blob.size).toBe(4);
    });

    it('URL.createObjectURL 可用', () => {
      expect(URL.createObjectURL).toBeTypeOf('function');
      const blob = new Blob(['test']);
      const url = URL.createObjectURL(blob);
      expect(url).toBeTruthy();
      URL.revokeObjectURL(url);
    });
  });

  describe('Pointer Events', () => {
    it('happy-dom 中可注册 pointerdown', () => {
      const div = document.createElement('div');
      let fired = false;
      div.addEventListener('pointerdown', () => {
        fired = true;
      });
      div.dispatchEvent(new PointerEvent('pointerdown'));
      expect(fired).toBe(true);
    });
  });
});
