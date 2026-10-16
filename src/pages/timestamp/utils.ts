export type TimestampUnit = 'auto' | 'seconds' | 'milliseconds';
export type TimeZone = 'local' | 'utc';

const DATE_LIMIT = 8_640_000_000_000_000;
const pad = (value: number, length = 2) => String(value).padStart(length, '0');

export function parseTimestamp(value: string, unit: TimestampUnit) {
  const text = value.trim();
  if (!text) return null;
  if (!/^[+-]?\d+(?:\.\d{1,3})?$/.test(text)) {
    throw new Error('请输入数字时间戳，秒时间戳最多支持 3 位小数。');
  }
  const number = Number(text);
  const resolvedUnit = unit === 'auto'
    ? (Math.abs(number) >= 1e11 ? 'milliseconds' : 'seconds')
    : unit;
  if (resolvedUnit === 'milliseconds' && !Number.isInteger(number)) {
    throw new Error('毫秒时间戳需为整数。');
  }
  const milliseconds = resolvedUnit === 'seconds' ? Math.round(number * 1000) : number;
  if (!Number.isSafeInteger(milliseconds) || Math.abs(milliseconds) > DATE_LIMIT) {
    throw new Error('时间戳超出可转换的日期范围。');
  }
  return { milliseconds, unit: resolvedUnit };
}

export function formatDatetime(milliseconds: number, zone: TimeZone) {
  const date = new Date(milliseconds);
  const utc = zone === 'utc';
  const year = utc ? date.getUTCFullYear() : date.getFullYear();
  const month = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
  const day = utc ? date.getUTCDate() : date.getDate();
  const hour = utc ? date.getUTCHours() : date.getHours();
  const minute = utc ? date.getUTCMinutes() : date.getMinutes();
  const second = utc ? date.getUTCSeconds() : date.getSeconds();
  return `${pad(year, 4)}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}.${pad(date.getUTCMilliseconds(), 3)}`;
}

export function formatOffset(milliseconds: number, zone: TimeZone) {
  const minutes = zone === 'utc' ? 0 : -new Date(milliseconds).getTimezoneOffset();
  return `UTC${minutes >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(minutes) / 60))}:${pad(Math.abs(minutes) % 60)}`;
}

export function parseDatetime(value: string, zone: TimeZone) {
  const text = value.trim();
  if (!text) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?(Z|[+-]\d{2}:?\d{2})?$/i.exec(text);
  if (!match) throw new Error('请输入 YYYY-MM-DD HH:mm:ss，可带毫秒或 ISO 时区。');
  const [, year, month, day, hour = '0', minute = '0', second = '0', fraction = '', offset] = match;
  const parts = [Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second), Number(fraction.padEnd(3, '0'))];
  const utc = Boolean(offset) || zone === 'utc';
  const date = new Date(0);
  if (utc) {
    date.setUTCFullYear(parts[0], parts[1], parts[2]);
    date.setUTCHours(parts[3], parts[4], parts[5], parts[6]);
  } else {
    date.setFullYear(parts[0], parts[1], parts[2]);
    date.setHours(parts[3], parts[4], parts[5], parts[6]);
  }
  const actual = utc
    ? [date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()]
    : [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
  if (parts.some((part, index) => part !== actual[index])) {
    throw new Error('日期或时间无效，请检查月份、天数和时分秒。');
  }
  let milliseconds = date.getTime();
  if (offset && offset.toUpperCase() !== 'Z') {
    const hours = Number(offset.slice(1, 3));
    const minutes = Number(offset.replace(':', '').slice(3, 5));
    if (hours > 23 || minutes > 59) throw new Error('ISO 时区偏移无效。');
    const sign = offset[0] === '+' ? 1 : -1;
    milliseconds -= sign * (hours * 60 + minutes) * 60_000;
  }
  return milliseconds;
}

export function convertInput<T>(parse: () => T) {
  try {
    return { result: parse(), error: '' };
  } catch (error) {
    return { result: null, error: error instanceof Error ? error.message : '无法转换，请检查输入。' };
  }
}
