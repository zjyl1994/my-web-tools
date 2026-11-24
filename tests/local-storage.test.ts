import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { readLocalStorage, readStoredList, repairLocalStorage, writeLocalStorage } from '../src/utils/local-storage.ts';

const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const values = new Map<string, string>();
const isText = (value: unknown): value is string => typeof value === 'string';
const decodeText = (value: unknown) => isText(value) ? value : undefined;
const readText = (key: string) => readLocalStorage(key, (raw) => {
  const value: unknown = JSON.parse(raw);
  if (isText(value)) return { value };
});

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  });
});

afterEach(() => {
  values.clear();
  if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
  else Reflect.deleteProperty(globalThis, 'localStorage');
});

test('missing and valid values require no repair', () => {
  assert.deepEqual(readText('missing'), {});
  values.set('draft', JSON.stringify(''));
  assert.deepEqual(readText('draft'), { value: '' });
});

test('removes malformed JSON and values with the wrong type', () => {
  values.set('other', 'untouched');
  for (const invalid of ['{', 'null', '{}', '42', '']) {
    values.set('draft', invalid);
    const stored = readText('draft');
    assert.equal(stored.value, undefined);
    assert.equal(values.get('draft'), invalid);
    repairLocalStorage(stored.repair);
    assert.equal(values.has('draft'), false);
  }
  assert.equal(values.get('other'), 'untouched');
});

test('repairs lists in order and removes an invalid list with no valid items', () => {
  values.set('history', '["first", null, false, "first", "second"]');
  const stored = readStoredList('history', decodeText, true);
  assert.deepEqual(stored.value, ['first', 'second']);
  repairLocalStorage(stored.repair);
  assert.deepEqual(JSON.parse(values.get('history')!), ['first', 'second']);

  values.set('history', '[null]');
  repairLocalStorage(readStoredList('history', decodeText).repair);
  assert.equal(values.has('history'), false);
});

test('persists changes made by an item decoder without discarding the item', () => {
  values.set('history', '[" first ", "second"]');
  const stored = readStoredList('history', (value) => decodeText(value)?.trim());
  assert.deepEqual(stored.value, ['first', 'second']);
  repairLocalStorage(stored.repair);
  assert.equal(values.get('history'), '["first","second"]');
});

test('repair leaves a newer value alone', () => {
  values.set('draft', 'null');
  const stored = readText('draft');
  writeLocalStorage('draft', '"new"');
  repairLocalStorage(stored.repair);
  assert.equal(values.get('draft'), '"new"');
});

test('unavailable storage falls back without throwing', () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() { throw new Error('Storage unavailable'); },
  });
  assert.deepEqual(readText('draft'), {});
  assert.equal(writeLocalStorage('draft', 'text'), false);
  assert.equal(writeLocalStorage('draft', null), false);
  repairLocalStorage({ key: 'draft', original: 'null', replacement: null });
});
