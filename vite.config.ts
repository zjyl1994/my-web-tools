import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

const foldedLazyPages = new Set([
    'lazygo',
    'sqlfmt',
    'lottery',
    'pricecalc',
    'jwt',
    'barcode',
]);

const foldedLazyChunkFiles = new Set<string>();

const getNodeModulePackageName = (id: string) => {
    const normalizedId = id.split(path.sep).join('/');
    const nodeModulesMarker = '/node_modules/';
    const nodeModulesIndex = normalizedId.lastIndexOf(nodeModulesMarker);

    if (nodeModulesIndex === -1) {
        return null;
    }

    const packagePath = normalizedId.slice(nodeModulesIndex + nodeModulesMarker.length);
    const parts = packagePath.split('/');

    if (parts[0]?.startsWith('@') && parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`;
    }

    return parts[0] ?? null;
};

const trackFoldedLazyChunks = () => ({
    name: 'track-folded-lazy-chunks',
    generateBundle(_: unknown, bundle: Record<string, { type: string; isDynamicEntry?: boolean; facadeModuleId?: string | null; fileName: string }>) {
        foldedLazyChunkFiles.clear();

        for (const output of Object.values(bundle)) {
            if (output.type !== 'chunk' || !output.facadeModuleId) {
                continue;
            }

            const normalizedId = output.facadeModuleId.split(path.sep).join('/');
            const match = normalizedId.match(/\/src\/pages\/([^/]+)\/index\.tsx$/);
            if (!match) {
                continue;
            }

            const pageName = match[1];

            if (output.isDynamicEntry && foldedLazyPages.has(pageName)) {
                foldedLazyChunkFiles.add(output.fileName);
            }
        }
    },
});

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    define: {
        __BUILD_TIMESTAMP__: new Date().getTime(),
    },
    plugins: [
        trackFoldedLazyChunks(),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
                'favicon.ico',
                'images/apple-touch-icon.png',
                'images/favicon-16x16.png',
                'images/favicon-32x32.png',
                'images/circuit.png',
            ],
            manifest: {
                name: '鱼 sifu 工具包',
                short_name: '工具包',
                description: '鱼 sifu 的在线小工具合集包',
                theme_color: 'rgb(248, 249, 250)',
                background_color: 'white',
                lang: 'zh-CN',
                start_url: '/',
                dir: 'ltr',
                display: 'standalone',
                icons: [
                    {
                        src: 'images/android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'images/android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                globIgnores: [
                    '**/assets/vendor-qrcode-*.js',
                    '**/assets/vendor-sqlfmt-*.js',
                ],
                manifestTransforms: [
                    async (entries) => ({
                        manifest: entries.filter((entry) => !foldedLazyChunkFiles.has(entry.url)),
                        warnings: [],
                    }),
                ],
                navigateFallbackDenylist: [/^\/assets\//, /\/[^/?]+\.(js|css|wasm)$/],
            },
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id: string) {
                    if (id.includes('node_modules')) {
                        const packageName = getNodeModulePackageName(id);

                        if (!packageName) {
                            return 'vendor-others';
                        }

                        if (packageName.startsWith('@codemirror/') || packageName.startsWith('@lezer/')) {
                            return 'vendor-codemirror';
                        } else if (packageName === 'sql-formatter') {
                            return 'vendor-sqlfmt';
                        } else if (packageName === 'react-datepicker' || packageName === 'date-fns' || packageName === 'clsx') {
                            return;
                        } else if (
                            packageName === 'react' ||
                            packageName === 'react-dom' ||
                            packageName === 'react-router' ||
                            packageName === 'react-router-dom' ||
                            packageName === 'scheduler' ||
                            packageName === 'react-toastify' ||
                            packageName.startsWith('@base-ui/') ||
                            packageName.startsWith('@floating-ui/')
                        ) {
                            return 'vendor-react';
                        } else if (packageName === 'qrcode') {
                            return 'vendor-qrcode';
                        } else {
                            return 'vendor-others';
                        }
                    }
                }
            }
        }
    },
})
