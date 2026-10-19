import { zipSync } from 'fflate';

export function createPngZip(items: Array<{ number: number; url: string }>) {
    const files: Record<string, Uint8Array> = {};
    for (const item of items) {
        if (!item.url) continue;
        const binary = atob(item.url.slice(item.url.indexOf(',') + 1));
        files[`${item.number}.png`] = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    }
    // PNG data is already compressed; store it without recompressing.
    return zipSync(files, { level: 0 });
}
