import { useEffect, useState } from 'react';

type InstallChoice = { outcome: 'accepted' | 'dismissed' };
interface InstallPromptEvent extends Event {
  prompt(): Promise<InstallChoice>;
}

export function usePwaInstall() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true,
  );

  useEffect(() => {
    const rememberPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const markInstalled = () => {
      setPromptEvent(null);
      setInstalled(true);
    };
    window.addEventListener('beforeinstallprompt', rememberPrompt);
    window.addEventListener('appinstalled', markInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', rememberPrompt);
      window.removeEventListener('appinstalled', markInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) return 'manual';
    setPromptEvent(null);
    const choice = await promptEvent.prompt();
    return choice.outcome;
  }

  return { installed, install };
}
