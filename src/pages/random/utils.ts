export const MAX_GENERATION_COUNT = 1000;
export const MAX_STRING_LENGTH = 256;

export const characterGroups = [
  { id: 'lowercase', label: '小写字母 a–z', characters: 'abcdefghijklmnopqrstuvwxyz' },
  { id: 'uppercase', label: '大写字母 A–Z', characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  { id: 'digits', label: '数字 0–9', characters: '0123456789' },
  { id: 'symbols', label: '符号', characters: '!@#$%^&*()-_=+[]{};:,.?' },
] as const;

export function validateCount(count: number) {
  if (!Number.isInteger(count) || count < 1 || count > MAX_GENERATION_COUNT) {
    throw new Error(`生成数量需为 1–${MAX_GENERATION_COUNT} 的整数。`);
  }
}

export function generationCountError(text: string) {
  try {
    validateCount(Number(text));
    return '';
  } catch (error) {
    return (error as Error).message;
  }
}

// Reuse random bytes across a batch; rejection sampling keeps every outcome equally likely.
function createRandomSource() {
  const buffer = new Uint32Array(1024);
  let offset = buffer.length;
  function nextWord() {
    if (offset === buffer.length) {
      crypto.getRandomValues(buffer);
      offset = 0;
    }
    return buffer[offset++];
  }
  return (range: bigint) => {
    const space = 1n << 64n;
    const limit = space - space % range;
    let sample: bigint;
    do {
      sample = (BigInt(nextWord()) << 32n) | BigInt(nextWord());
    } while (sample >= limit);
    return sample % range;
  };
}

export function generateNumbers(min: number, max: number, count: number) {
  validateCount(count);
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) {
    throw new Error('上下限需为安全整数（绝对值不超过 9007199254740991）。');
  }
  if (min > max) throw new Error('最小值不能大于最大值。');
  const random = createRandomSource();
  const start = BigInt(min);
  const range = BigInt(max) - start + 1n;
  return Array.from({ length: count }, () => (start + random(range)).toString()).join('\n');
}

export function generateStrings(length: number, characters: string, count: number) {
  validateCount(count);
  if (!Number.isInteger(length) || length < 1 || length > MAX_STRING_LENGTH) {
    throw new Error(`字符串长度需为 1–${MAX_STRING_LENGTH} 的整数。`);
  }
  const alphabet = Array.from(new Set(characters));
  if (alphabet.length === 0) throw new Error('请至少选择一种字符。');
  const random = createRandomSource();
  const range = BigInt(alphabet.length);
  return Array.from({ length: count }, () =>
    Array.from({ length }, () => alphabet[Number(random(range))]).join(''),
  ).join('\n');
}
