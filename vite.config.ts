import path from 'path';
import { defineConfig } from 'vite';
import { ejsBuilder } from './ejs-builder-plugin';
import { readdirSync } from 'fs';

const hash = new Date().getTime() + '';

const bootstrapVariants = readdirSync('./src/assets/css/')
	.filter(file => file.startsWith('bootstrap-'))
	.map(file => path.resolve(import.meta.dirname, 'src', 'assets', 'css', file));

export default defineConfig(__config => {
	console.log(bootstrapVariants);

	return {
		resolve: {
			alias: {
				'@': path.resolve(import.meta.dirname, 'src'),
			},
		},
		build: {
			copyPublicDir: true,
			emptyOutDir: false,
			write: true,
			outDir: 'dist',
			ssr: false,
			rollupOptions: {
				input: [
					...bootstrapVariants,
					'./src/assets/css/main.css',
					'./src/assets/js/main.ts',
				],
				output: {
					chunkFileNames: `assets/js/[name]-${hash}.js`,
					entryFileNames: `assets/js/[name]-${hash}.js`,
					assetFileNames: `assets/css/[name]-${hash}.css`,
				},
			},
		},
		server: {
			port: 3000,
			watch: {
				usePolling: true,
			},
			hmr: {
				host: 'localhost',
			},
		},
		plugins: [ejsBuilder(hash)],
	};
});
