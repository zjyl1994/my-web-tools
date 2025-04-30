import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    define: {
        __BUILD_TIMESTAMP__: new Date().getTime(),
        __README_CONTENT__: JSON.stringify(fs.readFileSync(path.resolve(__dirname, 'README.md'), 'utf-8')),
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
                'favicon.ico',
                'images/apple-touch-icon.png',
                'images/favicon-16x16.png',
                'images/favicon-32x32.png',
                'images/shortcuts-icon.png',
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
                shortcuts: [
                    {
                        name: 'JSON',
                        url: '/json',
                        icons: [
                            {
                                src: 'images/shortcuts-icon.png',
                                sizes: '96x96',
                                type: 'image/png'
                            }
                        ],
                    },
                    {
                        name: '编解码',
                        url: '/encoder',
                        icons: [
                            {
                                src: 'images/shortcuts-icon.png',
                                sizes: '96x96',
                                type: 'image/png'
                            }
                        ],
                    },
                    {
                        name: '文本处理',
                        url: '/textproc',
                        icons: [
                            {
                                src: 'images/shortcuts-icon.png',
                                sizes: '96x96',
                                type: 'image/png'
                            }
                        ],
                    },
                    {
                        name: '大卡计算',
                        url: '/kcal',
                        icons: [
                            {
                                src: 'images/shortcuts-icon.png',
                                sizes: '96x96',
                                type: 'image/png'
                            }
                        ],
                    },
                    {
                        name: '密码机',
                        url: '/code',
                        icons: [
                            {
                                src: 'images/shortcuts-icon.png',
                                sizes: '96x96',
                                type: 'image/png'
                            }
                        ],
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}']
            },
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id: string) {
                    if (id.includes('node_modules')) {
                        if (id.includes('sql-formatter')) {
                            return 'vendor-sqlfmt';
                        } else if (id.includes('react')) {
                            return 'vendor-react';
                        } else if (id.includes('onnxruntime')) {
                            return 'vendor-onnxruntime';
                        } else if (id.includes('transformers')) {
                            return 'vendor-transformers';
                        } else {
                            return 'vendor-others';
                        }
                    }
                }
            }
        }
    },
    optimizeDeps: {
      exclude: ['@huggingface/transformers'] // Prevent optimization of transformers.js
    }
})
