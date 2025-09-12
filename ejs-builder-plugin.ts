import { execa } from 'execa';
import fse from 'fs-extra';
import { sync } from 'glob';
import path from 'path';
import { OutputBundle } from 'rollup';
import { nodeExternals } from 'rollup-plugin-node-externals';
import { build, PluginOption, ResolvedConfig } from 'vite';


let source: Record<string, any>;

const regex = /node_modules|\.ts|\.mjs|\.json/;

async function copyEjsFiles(bundle: OutputBundle, outDir: string, hash: string) {
	const ejsFiles = sync('./src/views/**/*.ejs'.replace(/\\/g, '/'));
	const regex = /<script.*(\/script>)/gs;

	for (let i = 0; i < ejsFiles.length; i++) {
		const file = ejsFiles[i].replace('src', outDir);
		let content = fse.readFileSync(ejsFiles[i], 'utf-8');

		if (file.includes('head')) {
			content = content.replaceAll('.css?t=<%= new Date().getTime() %>', `-${hash}.css`);
			fse.outputFileSync(file, content, 'utf-8');
		} else if (content.includes('</script>')) {
			Object.keys(bundle)
				.filter(key => key.endsWith('.js'))
				.forEach(key => {
					content = content.replace(regex, `<script src="/${key}"></script>`);
				});

			fse.outputFileSync(file, content, 'utf-8');
		} else {
			fse.outputFileSync(file, content, 'utf-8');
		}
	}
}

async function buildBackend(outDir: string) {
	await build({
		resolve: {
			alias: {
				'@': path.resolve(import.meta.dirname, 'src'),
			},
		},
		ssr: {
			external: [],
			noExternal: [],
		},
		build: {
			outDir,
			ssr: './src/server.ts',
			write: true,
			minify: false,
			target: 'esnext',
			emptyOutDir: false,
			rollupOptions: {
				output: {
					format: 'cjs',
					entryFileNames: 'server.js',
					chunkFileNames: '[name]-[hash].js',
					assetFileNames: '[name]-[hash].[ext]',
				},
			},
		},
		plugins: [nodeExternals()],
	});
}

export const ejsBuilder = (hash: string): PluginOption => {
	let config: ResolvedConfig;

	return [
		{
			name: 'ejs-builder-plugin:serve',
			enforce: 'pre',
			apply: 'serve',

			async configureServer(server) {
				server.middlewares.use(async (req, res, next) => {
					
					if (regex.test(req.url || '')) {
						next();
					} else {
						try {
							if (!source) {
								source = await server.ssrLoadModule('./src/app.ts');
							}

							return await source.app(req, res, next);
						} catch (error) {
							if (typeof error === 'object' && error instanceof Error) {
								server.ssrFixStacktrace(error);
							}
							next(error);
						}
					}
				});
			},

			handleHotUpdate({ file, server }) {
				if (regex.test(file)) {
					console.log(`reloading ${file} ...`);
					server.restart();
				} else {
					server.ws.send({
						type: 'full-reload',
						path: '*',
					});
				}
			},
		},
		{
			name: 'ejs-builder-plugin:build',
			enforce: 'pre',
			apply: 'build',

			configResolved(_config) {
				config = _config;
			},

			buildStart: async () => {
				if (process.env.STOP_BUILDING) return;
				process.env.STOP_BUILDING = 'true';

				await buildBackend(config.build.outDir);

				fse.copySync('.env', `${config.build.outDir}/.env`);
				fse.copySync('src/favicon.ico', `${config.build.outDir}/favicon.ico`);
				fse.copySync('src/assets/image', `${config.build.outDir}/assets/image`);
				fse.copySync('src/locales', `${config.build.outDir}/locales`);

				fse.copySync('package.json', `${config.build.outDir}/package.json`);
				await execa({ cwd: config.build.outDir })`npm pkg delete devDependencies`;
				await execa({ cwd: config.build.outDir })`npm pkg set type=commonjs`;
			},

			async writeBundle(__options, bundle) {
				copyEjsFiles(bundle, config.build.outDir, hash);
			},
		},
	];
};
