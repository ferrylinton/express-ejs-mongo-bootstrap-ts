import path from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';

const getFiles = () => {
	const result: Record<string, string> = {};
	const folder = './src/assets/scss/';
	const files = fs.readdirSync(folder);

	for (const file of files) {
		const filePath = path.join(folder, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			result[file] = path.join(folder, file, 'theme.scss');
		}
	}

	return result;
};

export default defineConfig(__config => {

	return {
		build: {
			copyPublicDir: false,
			emptyOutDir: false,
			write: true,
			outDir: 'src',
			ssr: false,
			minify: false,
			cssMinify: false,
			rollupOptions: {
				input: getFiles(),
				output: {
					chunkFileNames: `assets/js/[name].js`,
					entryFileNames: `assets/js/[name].js`,
					assetFileNames: `assets/css/[name].css`,
				},
			},
		},
		css: {
			preprocessorOptions: {
				scss: {
					silenceDeprecations: [
						'import',
						'mixed-decls',
						'color-functions',
						'global-builtin',
						'legacy-js-api',
					],
				},
			},
		},
	};
});
