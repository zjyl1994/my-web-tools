import { useEffect, useRef, useState } from 'react';
import { encodeStoredList, readLocalStorage, readStoredList, repairLocalStorage, writeLocalStorage } from '@/utils/local-storage';

export function useStorageRepair(repair: Parameters<typeof repairLocalStorage>[0]) {
  useEffect(() => repairLocalStorage(repair), [repair]);
}

export function useSaveStoredValue<T>(
  key: string | null,
  value: T,
  encode: (value: T) => string | null = JSON.stringify,
  onError?: () => void,
) {
  const previous = useRef({ key, value });
  useEffect(() => {
    const changed = previous.current.key === key && !Object.is(previous.current.value, value);
    previous.current = { key, value };
    if (key !== null && changed && !writeLocalStorage(key, encode(value))) onError?.();
  }, [key, value, encode, onError]);
}

export function useStoredState<T>(key: string, defaultValue: T, validate?: (value: T) => boolean) {
  const [stored] = useState(() => readLocalStorage(key, (raw) => {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== typeof defaultValue || parsed === null || Array.isArray(parsed) !== Array.isArray(defaultValue)) return;
    const value = parsed as T;
    if (!validate || validate(value)) return { value };
  }));
  const [value, setValue] = useState(() => stored.value ?? defaultValue);
  useStorageRepair(stored.repair);
  useSaveStoredValue(key, value);
  return [value, setValue] as const;
}

export function useStoredList<T>(key: string, decodeItem: (item: unknown) => T | undefined, unique = false) {
  const [stored] = useState(() => readStoredList(key, decodeItem, unique));
  const [items, setItems] = useState(stored.value ?? []);
  useStorageRepair(stored.repair);
  useSaveStoredValue(key, items, encodeStoredList);
  return [items, setItems] as const;
}
