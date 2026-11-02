import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
		],
		server: {
			open: true,
			proxy: {
				"/api": {
					target: "http://127.0.0.1:5000",
					changeOrigin: true,
				},
			},
		},
	};
});
