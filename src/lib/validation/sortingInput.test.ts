import { describe, it, expect } from 'vitest';
import {
  SORTING_MIN_SIZE,
  SORTING_MAX_SIZE,
  SORTING_DEFAULT_SIZE,
  SORTING_SNAPSHOT_FORMAT_VERSION,
  sortingNumbersSchema,
  validateSortingNumbers,
  parseCustomSortingInputText,
  parseSortingImportJson,
} from './sortingInput.ts';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('sorting constants', () => {
  it('exports expected constant values', () => {
    expect(SORTING_MIN_SIZE).toBe(3);
    expect(SORTING_MAX_SIZE).toBe(50);
    expect(SORTING_DEFAULT_SIZE).toBe(14);
    expect(SORTING_SNAPSHOT_FORMAT_VERSION).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// sortingNumbersSchema
// ---------------------------------------------------------------------------

describe('sortingNumbersSchema', () => {
  it('accepts a valid number array', () => {
    const result = sortingNumbersSchema.safeParse([5, 3, 1]);
    expect(result.success).toBe(true);
  });

  it('rejects non-integer values', () => {
    const result = sortingNumbersSchema.safeParse([1.5, 2, 3]);
    expect(result.success).toBe(false);
  });

  it('rejects arrays shorter than SORTING_MIN_SIZE', () => {
    const result = sortingNumbersSchema.safeParse([1, 2]);
    expect(result.success).toBe(false);
  });

  it('rejects arrays longer than SORTING_MAX_SIZE', () => {
    const result = sortingNumbersSchema.safeParse(
      Array.from({ length: SORTING_MAX_SIZE + 1 }, (_, i) => i)
    );
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateSortingNumbers
// ---------------------------------------------------------------------------

describe('validateSortingNumbers', () => {
  describe('valid inputs', () => {
    it('accepts exactly SORTING_MIN_SIZE integers', () => {
      const result = validateSortingNumbers([1, 2, 3]);
      expect(result).toEqual({ ok: true, message: '' });
    });

    it('accepts exactly SORTING_MAX_SIZE integers', () => {
      const numbers = Array.from({ length: SORTING_MAX_SIZE }, (_, i) => i + 1);
      const result = validateSortingNumbers(numbers);
      expect(result).toEqual({ ok: true, message: '' });
    });

    it('accepts mixed positive and negative integers', () => {
      const result = validateSortingNumbers([-5, 0, 10]);
      expect(result).toEqual({ ok: true, message: '' });
    });
  });

  describe('invalid inputs', () => {
    it('rejects fewer than SORTING_MIN_SIZE elements', () => {
      const result = validateSortingNumbers([1, 2]);
      expect(result.ok).toBe(false);
      expect(result.message).toBeTruthy();
    });

    it('rejects more than SORTING_MAX_SIZE elements', () => {
      const numbers = Array.from({ length: SORTING_MAX_SIZE + 1 }, (_, i) => i);
      const result = validateSortingNumbers(numbers);
      expect(result.ok).toBe(false);
      expect(result.message).toBeTruthy();
    });

    it('rejects an empty array', () => {
      const result = validateSortingNumbers([]);
      expect(result.ok).toBe(false);
      expect(result.message).toBeTruthy();
    });

    it('rejects non-integer (float) values', () => {
      const result = validateSortingNumbers([1.5, 2, 3]);
      expect(result.ok).toBe(false);
      expect(result.message).toContain('整数');
    });

    it('rejects non-number values (type-level, runtime coercion aside)', () => {
      // Zod with z.number() rejects strings at runtime
      // @ts-expect-error -- testing runtime rejection of wrong type
      const result = validateSortingNumbers(['a', 'b', 'c']);
      expect(result.ok).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// parseCustomSortingInputText
// ---------------------------------------------------------------------------

describe('parseCustomSortingInputText', () => {
  describe('valid inputs', () => {
    it('parses a simple comma-separated string', () => {
      const result = parseCustomSortingInputText('1,2,3');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.numbers).toEqual([1, 2, 3]);
      }
    });

    it('trims whitespace around values', () => {
      const result = parseCustomSortingInputText(' 1 , 2 , 3 ');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.numbers).toEqual([1, 2, 3]);
      }
    });

    it('parses larger valid input sets', () => {
      const result = parseCustomSortingInputText('10,20,30,40,50');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.numbers).toEqual([10, 20, 30, 40, 50]);
      }
    });

    it('handles negative integers', () => {
      const result = parseCustomSortingInputText('-1,0,5');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.numbers).toEqual([-1, 0, 5]);
      }
    });
  });

  describe('invalid inputs', () => {
    it('rejects input with too few values', () => {
      const result = parseCustomSortingInputText('1,2');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBeTruthy();
      }
    });

    it('rejects non-numeric tokens', () => {
      const result = parseCustomSortingInputText('1,abc,3');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('整数');
      }
    });

    it('rejects an empty string', () => {
      const result = parseCustomSortingInputText('');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBeTruthy();
      }
    });

    it('rejects float values', () => {
      const result = parseCustomSortingInputText('1.5,2,3');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('整数');
      }
    });

    it('rejects input with too many values', () => {
      const text = Array.from({ length: SORTING_MAX_SIZE + 1 }, (_, i) => i).join(',');
      const result = parseCustomSortingInputText(text);
      expect(result.ok).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// parseSortingImportJson
// ---------------------------------------------------------------------------

describe('parseSortingImportJson', () => {
  describe('valid inputs', () => {
    it('accepts a full snapshot with formatVersion', () => {
      const json = JSON.stringify({
        formatVersion: 1,
        sortingInput: [1, 2, 3],
      });
      const result = parseSortingImportJson(json);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.numbers).toEqual([1, 2, 3]);
      }
    });

    it('accepts a snapshot without formatVersion', () => {
      const json = JSON.stringify({ sortingInput: [4, 5, 6] });
      const result = parseSortingImportJson(json);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.numbers).toEqual([4, 5, 6]);
      }
    });
  });

  describe('invalid inputs', () => {
    it('rejects a bare array with a migration message', () => {
      const json = JSON.stringify([1, 2, 3]);
      const result = parseSortingImportJson(json);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('JSON 格式已升级');
        expect(result.message).toContain('formatVersion');
      }
    });

    it('rejects malformed JSON', () => {
      const result = parseSortingImportJson('{not valid json');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('JSON 解析失败');
      }
    });

    it('rejects JSON missing the sortingInput key', () => {
      const json = JSON.stringify({ formatVersion: 1 });
      const result = parseSortingImportJson(json);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBeTruthy();
      }
    });

    it('rejects objects with extra keys (strict mode)', () => {
      const json = JSON.stringify({
        formatVersion: 1,
        sortingInput: [1, 2, 3],
        extra: 'not allowed',
      });
      const result = parseSortingImportJson(json);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBeTruthy();
      }
    });

    it('rejects when sortingInput has too few elements', () => {
      const json = JSON.stringify({ sortingInput: [1, 2] });
      const result = parseSortingImportJson(json);
      expect(result.ok).toBe(false);
    });

    it('rejects when sortingInput has too many elements', () => {
      const numbers = Array.from({ length: SORTING_MAX_SIZE + 1 }, (_, i) => i);
      const json = JSON.stringify({ sortingInput: numbers });
      const result = parseSortingImportJson(json);
      expect(result.ok).toBe(false);
    });

    it('rejects when sortingInput contains non-integers', () => {
      const json = JSON.stringify({ sortingInput: [1.5, 2, 3] });
      const result = parseSortingImportJson(json);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('整数');
      }
    });

    it('error messages contain Chinese text', () => {
      // Bare array produces migration hint
      const bare = parseSortingImportJson('[1,2,3]');
      expect(bare.ok).toBe(false);
      if (!bare.ok) {
        expect(bare.message).toMatch(/[一-鿿]/);
      }

      // Malformed JSON produces parse failure hint
      const malformed = parseSortingImportJson('not-json');
      expect(malformed.ok).toBe(false);
      if (!malformed.ok) {
        expect(malformed.message).toMatch(/[一-鿿]/);
      }

      // Too few elements produces count hint
      const tooFew = parseSortingImportJson('{"sortingInput":[1,2]}');
      expect(tooFew.ok).toBe(false);
      if (!tooFew.ok) {
        expect(tooFew.message).toMatch(/[一-鿿]/);
      }
    });
  });
});
