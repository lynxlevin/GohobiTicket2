import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => {
	return {
		build: {
			outDir: "build",
			rolldownOptions: {
				output: {
					codeSplitting: {
						groups: [
							{
								name: "react-vendor",
								test: /node_modules\/(react|react-dom|react-router-dom)/,
								minSize: 20000,
							},
							{
								name: "mui-x",
								test: /node_modules\/@mui\/x-*/,
								minSize: 20000,
							},
							{ name: "mui", test: /node_modules\/@mui/, minSize: 20000 },
							{ name: "emoji-picker-react", test: /node_modules\/emoji-picker-react/, minSize: 20000 },
							{ name: "node_modules", test: /node_modules/, minSize: 20000 },
						],
					},
				},
			},
		},
		plugins: [
			react(),
			VitePWA({
				registerType: 'autoUpdate',
				strategies: 'injectManifest',
				srcDir: 'src',
				filename: 'service-worker.ts',
				manifest: {
					"name": "ごほうびチケット",
					"short_name": "ごほうびチケット",
					"icons": [
						{
							"src": "/android-chrome-192x192.png",
							"sizes": "192x192",
							"type": "image/png",
							"purpose": "maskable"
						},
						{
							"src": "/android-chrome-512x512.png",
							"sizes": "512x512",
							"type": "image/png",
							"purpose": "maskable"
						}
					],
					"theme_color": "#ffffff",
					"background_color": "#ffffff",
					"display": "standalone",
					"start_url": "/"
				}
			})
		],
		server: {
			open: true,
			proxy: {
				"/api": {
					target: "http://127.0.0.1:8000",
					changeOrigin: true,
				},
			},
		},
	};
});
