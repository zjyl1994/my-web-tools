import { useCallback, useMemo, useState } from 'react';
import { encodeStoredList, readStoredList } from '@/utils/local-storage';
import { useSaveStoredValue, useStorageRepair } from '@/hooks/use-stored-state';

const EMPTY_HISTORY: string[] = [];
const decodeHistoryItem = (item: unknown) => typeof item === 'string' && item.trim().length > 0 ? item : undefined;

export function useInputHistory(key: string, max = 10) {
  const stored = useMemo(() => readStoredList(key, decodeHistoryItem, true), [key]);
  const initialHistory = stored.value ?? EMPTY_HISTORY;
  const [historyState, setHistoryState] = useState(() => ({ key, history: initialHistory }));
  const history = historyState.key === key ? historyState.history : initialHistory;
  useStorageRepair(stored.repair);
  useSaveStoredValue(key, history, encodeStoredList);

  const remember = useCallback((value: string) => {
    const v = value.trim();
    if (!v) return;
    setHistoryState(prev => {
      const current = prev.key === key ? prev.history : initialHistory;
      const next = [v, ...current.filter(i => i !== v)].slice(0, max);
      return { key, history: next };
    });
  }, [initialHistory, key, max]);

  const clear = useCallback(() => {
    setHistoryState({ key, history: [] });
  }, [key]);

  return { history, remember, clear };
}
