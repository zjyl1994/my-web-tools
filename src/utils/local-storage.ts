type Repair = { key: string; original: string; replacement: string | null };
type Decoded<T> = { value: T; replacement?: string | null };
type StoredValue<T> = { value?: T; repair?: Repair };

export function readLocalStorage<T>(
  key: string,
  decode: (raw: string) => Decoded<T> | undefined,
): StoredValue<T> {
  let original: string | null;
  try {
    original = localStorage.getItem(key);
  } catch {
    return {};
  }
  if (original === null) return {};

  let decoded: Decoded<T> | undefined;
  try {
    decoded = decode(original);
  } catch {
    // Decoding failures are handled when the component commits.
  }
  if (!decoded) return { repair: { key, original, replacement: null } };
  if (decoded.replacement === undefined) return { value: decoded.value };
  return { value: decoded.value, repair: { key, original, replacement: decoded.replacement } };
}

export function readStoredList<T>(key: string, decodeItem: (item: unknown) => T | undefined, unique = false) {
  return readLocalStorage(key, (raw) => {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    const items = parsed.map(decodeItem).filter((item): item is T => item !== undefined);
    const value = unique ? [...new Set(items)] : items;
    if (value.length === parsed.length && value.every((item, index) => Object.is(item, parsed[index]))) return { value };
    return { value, replacement: encodeStoredList(value) };
  });
}

export function encodeStoredList(items: readonly unknown[]) {
  return items.length ? JSON.stringify(items) : null;
}

export function writeLocalStorage(key: string, value: string | null): boolean {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function repairLocalStorage(repair: Repair | undefined) {
  if (!repair) return;
  try {
    // A newer value may have been saved before this component committed.
    if (localStorage.getItem(repair.key) === repair.original) {
      writeLocalStorage(repair.key, repair.replacement);
    }
  } catch {
    // Storage may be blocked.
  }
}
