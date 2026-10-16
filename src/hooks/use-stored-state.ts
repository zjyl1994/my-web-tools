import { useEffect, useState } from 'react';

export const useStoredState = <T,>(storageKey: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => readStoredValue(storageKey, defaultValue));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // ignore storage failures
    }
  }, [storageKey, value]);

  return [value, setValue] as const;
};

const readStoredValue = <T,>(storageKey: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(storageKey);
    return storedValue ? JSON.parse(storedValue) as T : defaultValue;
  } catch {
    return defaultValue;
  }
};

