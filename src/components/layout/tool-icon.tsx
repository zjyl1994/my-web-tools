const paths: Record<string, string> = {
  download: 'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',
  search: 'M16 16l5 5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  sidebar: 'M3 3h18v18H3z M9 3v18',
  fingerprint: 'M8 3a10 10 0 0 1 13 9 M3 8a10 10 0 0 1 2-3 M2 12v3 M6 19c2-3 1-5 1-7a5 5 0 0 1 10 0c0 5-1 7-3 10 M11 22c3-5 2-7 2-10a1 1 0 0 0-2 0c0 3 0 6-3 9 M21 16c0 2-1 4-2 5',
  clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z M12 6v6l4 2',
  shuffle: 'M3 6h3c5 0 7 12 12 12h3 M17 14l4 4-4 4 M3 18h3c2 0 3-2 4-4 M14 10c1-2 2-4 4-4h3 M17 2l4 4-4 4',
  home: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  braces: 'M9 3H7a2 2 0 0 0-2 2v4a3 3 0 0 1-2 3 3 3 0 0 1 2 3v4a2 2 0 0 0 2 2h2 M15 3h2a2 2 0 0 1 2 2v4a3 3 0 0 0 2 3 3 3 0 0 0-2 3v4a2 2 0 0 1-2 2h-2',
  arrows: 'M4 7h16m-4-4 4 4-4 4 M20 17H4m4-4-4 4 4 4',
  text: 'M4 5h16 M12 5v15 M8 20h8 M4 10V5 M20 10V5',
  columns: 'M3 4h7v16H3z M14 4h7v16h-7z M6 8h1 M6 12h1 M17 8h1 M17 16h1',
  database: 'M20 6c0 2-4 3-8 3S4 8 4 6s4-3 8-3 8 1 8 3Z M4 6v12c0 2 4 3 8 3s8-1 8-3V6 M4 12c0 2 4 3 8 3s8-1 8-3',
  code: 'm8 6-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18',
  key: 'M14 5a5 5 0 1 1-3 9L4 21H1v-3l7-7a5 5 0 0 1 6-6Z M16 8h.01',
  lock: 'M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4 M12 14v3',
  image: 'M3 3h18v18H3z M3 17l6-6 4 4 3-3 5 5 M15 7h.01',
  qr: 'M3 3h6v6H3z M15 3h6v6h-6z M3 15h6v6H3z M15 15h2v2h4v4h-6v-2 M21 13v2 M11 3v2 M3 11h2 M11 11h2v4 M11 19v2',
  flame: 'M12 2c1 5-4 6-4 10 0 2 1 3 2 3-1-4 3-4 3-7 5 4 6 6 6 9a7 7 0 0 1-14 0c0-6 5-9 7-15Z',
  calculator: 'M5 2h14v20H5z M8 6h8 M8 11h1 M15 11h1 M8 15h1 M15 15h1 M8 19h1 M15 19h1',
  ticket: 'M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V6Z M15 6v2 M15 11v2 M15 16v2',
  info: 'M12 8h.01 M12 11v6 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  arrow: 'M4 12h16 M14 6l6 6-6 6',
};

export default function ToolIcon({ name, className }: { name: string; className?: string }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] ?? paths.home} /></svg>;
}
