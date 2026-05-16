import { useCallback, useState } from 'react';

const readHistory = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as string[] : [];
  } catch {
    return [];
  }
};

export function useInputHistory(key: string, max = 10) {
  const [historyState, setHistoryState] = useState<{ key: string; history: string[] }>(() => {
    return { key, history: readHistory(key) };
  });
  const history = historyState.key === key ? historyState.history : readHistory(key);

  const remember = useCallback((value: string) => {
    const v = value.trim();
    if (!v) return;
    setHistoryState(prev => {
      const current = prev.key === key ? prev.history : readHistory(key);
      const next = [v, ...current.filter(i => i !== v)].slice(0, max);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore
      }
      return { key, history: next };
    });
  }, [key, max]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setHistoryState({ key, history: [] });
  }, [key]);

  return { history, remember, clear };
}
