import { useEffect, useState } from 'react';

const query = '(prefers-color-scheme: dark)';

export const usePrefersDark = () => {
  const [prefersDark, setPrefersDark] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return prefersDark;
};
