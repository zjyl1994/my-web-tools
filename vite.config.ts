import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';


// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    define: {
        BUILD_DATE: new Date().getTime(),
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
                'favicon.ico',
                'apple-touch-icon.png',
                'favicon-16x16.png',
                'favicon-32x32.png',
                'shortcuts-icon.png',
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
                        src: 'android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'android-chrome-512x512.png',
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
                                src: 'shortcuts-icon.png',
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
                                src: 'shortcuts-icon.png',
                                sizes: '96x96',
                                type: 'image/png'
                            }
                        ],
                    },
                    {
                        name: '文本处理',
                        url: '/textproc',
                    },
                    {
                        name: '大卡计算',
                        url: '/kcal',
                    },
                    {
                        name: '密码机',
                        url: '/code',
                    }
                ]
            }
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
                        } else {
                            return 'vendor-others';
                        }
                    }
                }
            }
        }
    }
})
