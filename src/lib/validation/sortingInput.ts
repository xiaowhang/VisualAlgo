import { z } from 'zod';

export const SORTING_MIN_SIZE = 3;
export const SORTING_MAX_SIZE = 50;
export const SORTING_DEFAULT_SIZE = 14;
export const SORTING_SNAPSHOT_FORMAT_VERSION = 1;

export type SortingInputResult = {
  ok: boolean;
  message: string;
};

export const sortingNumbersSchema = z
  .array(z.number().int('仅支持整数。'))
  .min(SORTING_MIN_SIZE, `请输入 ${SORTING_MIN_SIZE}-${SORTING_MAX_SIZE} 个整数。`)
  .max(SORTING_MAX_SIZE, `请输入 ${SORTING_MIN_SIZE}-${SORTING_MAX_SIZE} 个整数。`);

const sortingCustomTextSchema = z
  .string()
  .transform(rawText =>
    rawText
      .split(',')
      .map(part => part.trim())
      .filter(Boolean)
  )
  .pipe(
    z.array(
      z
        .string()
        .regex(/^-?\d+$/, '仅支持整数。')
        .transform(value => Number(value))
    )
  )
  .pipe(sortingNumbersSchema);

const sortingSnapshotSchema = z
  .object({
    formatVersion: z.number().int().optional(),
    sortingInput: sortingNumbersSchema,
  })
  .strict();

function getFirstIssueMessage(error: z.ZodError) {
  const firstIssue = error.issues[0];
  return firstIssue?.message ?? '输入数据格式无效。';
}

export function validateSortingNumbers(numbers: number[]): SortingInputResult {
  const parseResult = sortingNumbersSchema.safeParse(numbers);

  if (!parseResult.success) {
    return {
      ok: false,
      message: getFirstIssueMessage(parseResult.error),
    };
  }

  return {
    ok: true,
    message: '',
  };
}

export function parseCustomSortingInputText(
  rawText: string
): { ok: true; numbers: number[] } | { ok: false; message: string } {
  const parseResult = sortingCustomTextSchema.safeParse(rawText);

  if (!parseResult.success) {
    return {
      ok: false,
      message: getFirstIssueMessage(parseResult.error),
    };
  }

  return {
    ok: true,
    numbers: parseResult.data,
  };
}

export function parseSortingImportJson(
  rawText: string
): { ok: true; numbers: number[] } | { ok: false; message: string } {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    return {
      ok: false,
      message: 'JSON 解析失败，请检查文件内容。',
    };
  }

  if (Array.isArray(parsed)) {
    return {
      ok: false,
      message:
        'JSON 格式已升级，请使用对象格式：{ "formatVersion": 1, "sortingInput": [1, 2, 3] }。',
    };
  }

  const parseResult = sortingSnapshotSchema.safeParse(parsed);

  if (!parseResult.success) {
    return {
      ok: false,
      message: getFirstIssueMessage(parseResult.error),
    };
  }

  return {
    ok: true,
    numbers: parseResult.data.sortingInput,
  };
}
