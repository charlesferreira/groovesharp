/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
// O app é publicado em https://charlesferreira.github.io/groovesharp/
var BASE = '/groovesharp/';
export default defineConfig({
    base: BASE,
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo.svg'],
            manifest: {
                name: 'GrooveSharp',
                short_name: 'GrooveSharp',
                description: 'Acompanhe a saúde do seu setlist e chegue no ponto pro show.',
                lang: 'pt-BR',
                theme_color: '#0f1115',
                background_color: '#0f1115',
                display: 'standalone',
                orientation: 'portrait',
                start_url: BASE,
                scope: BASE,
                icons: [
                    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                    { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
        }),
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        css: false,
    },
});
