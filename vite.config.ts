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
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: '鱼 sifu 工具包',
                short_name: '工具包',
                description: '鱼 sifu 的在线小工具合集包',
                theme_color: 'rgb(248, 249, 250)',
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
