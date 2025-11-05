import { useCallback, useEffect, useState } from 'react';

export function useInputHistory(key: string, max = 10) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [key]);

  const remember = useCallback((value: string) => {
    const v = value.trim();
    if (!v) return;
    setHistory(prev => {
      const next = [v, ...prev.filter(i => i !== v)].slice(0, max);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, [key, max]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setHistory([]);
  }, [key]);

  return { history, remember, clear };
}

