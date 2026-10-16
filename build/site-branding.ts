import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { Plugin } from 'vite';

export const siteIconPaths = {
    favicon16: '/site-icons/favicon-16.png',
    favicon32: '/site-icons/favicon-32.png',
    apple: '/site-icons/apple-touch-icon.png',
    app192: '/site-icons/icon-192.png',
    app512: '/site-icons/icon-512.png',
};

function ico(images: Buffer[]) {
    const header = Buffer.alloc(6 + images.length * 16);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(images.length, 4);
    let offset = header.length;
    images.forEach((image, index) => {
        const entry = 6 + index * 16;
        const size = [16, 32, 48][index];
        header[entry] = size;
        header[entry + 1] = size;
        header.writeUInt16LE(1, entry + 4);
        header.writeUInt16LE(32, entry + 6);
        header.writeUInt32LE(image.length, entry + 8);
        header.writeUInt32LE(offset, entry + 12);
        offset += image.length;
    });
    return Buffer.concat([header, ...images]);
}

export function siteBranding(config: { name: string; icon: string }): Plugin {
    let root: string;
    let isBuild = false;
    let outputs: Map<string, Buffer>;
    async function generate() {
        const source = await readFile(path.resolve(root, config.icon));
        const sizes = [16, 32, 48, 180, 192, 512];
        const images = await Promise.all(sizes.map(size => sharp(source)
            .rotate().resize(size, size, { fit: 'cover', position: 'centre' }).png().toBuffer()));
        outputs = new Map([
            [siteIconPaths.favicon16, images[0]],
            [siteIconPaths.favicon32, images[1]],
            [siteIconPaths.apple, images[3]],
            [siteIconPaths.app192, images[4]],
            [siteIconPaths.app512, images[5]],
            ['/favicon.ico', ico(images.slice(0, 3))],
        ]);
    }
    return {
        name: 'site-branding',
        configResolved(resolved) { root = resolved.root; isBuild = resolved.command === 'build'; },
        async buildStart() {
            if (!config.name.trim() || !config.icon.trim()) throw new Error('Site name and icon must not be empty.');
            this.addWatchFile(path.resolve(root, config.icon));
            await generate();
            if (isBuild) {
                for (const [url, source] of outputs) this.emitFile({ type: 'asset', fileName: url.slice(1), source });
            }
        },
        configureServer(server) {
            const iconPath = path.resolve(root, config.icon);
            server.watcher.add(iconPath);
            server.watcher.on('change', async changed => {
                if (changed !== iconPath) return;
                try { await generate(); server.ws.send({ type: 'full-reload' }); }
                catch (error) { server.config.logger.error(String(error)); }
            });
            server.middlewares.use((request, response, next) => {
                const url = request.url?.split('?')[0] ?? '';
                const image = outputs?.get(url);
                if (!image) return next();
                response.setHeader('Content-Type', url.endsWith('.ico') ? 'image/x-icon' : 'image/png');
                response.setHeader('Cache-Control', 'no-cache');
                response.end(image);
            });
        },
        transformIndexHtml(html) {
            const title = config.name.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
            return html.replace('<title></title>', `<title>${title}</title>`);
        },
    };
}
