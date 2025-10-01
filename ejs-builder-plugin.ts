import { execa } from 'execa';
import fse from 'fs-extra';
import { sync } from 'glob';
import path from 'path';
import { OutputBundle } from 'rollup';
import { build, PluginOption, ResolvedConfig } from 'vite';

let source: Record<string, any>;

const regex = /node_modules|\.ts|\.mjs|\.json/;
const hotReloadRegex = /\.css|\.ts|\.mjs|\.json/;

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

async function buildBackend(ssr: string, outDir: string) {
	await build({
		resolve: {
			alias: {
				'@': path.resolve(import.meta.dirname, 'src'),
			},
		},
		ssr: {
			external: true,
		},
		build: {
			outDir,
			ssr,
			write: true,
			minify: false,
			target: 'esnext',
			emptyOutDir: false,
			rollupOptions: {
				output: {
					preserveModules: true,
					format: 'esm',
					entryFileNames: '[name].js',
				},
			},
		},
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
				if (hotReloadRegex.test(file)) {
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

				await buildBackend('./src/db/init-db.ts', config.build.outDir);
				await buildBackend('./src/db/init-data.ts', config.build.outDir);
				await buildBackend('./src/server.ts', config.build.outDir);

				fse.copySync('.env', `${config.build.outDir}/.env`);
				fse.copySync('src/favicon.ico', `${config.build.outDir}/favicon.ico`);
				fse.copySync('src/assets/image', `${config.build.outDir}/assets/image`);
				fse.copySync('src/locales', `${config.build.outDir}/locales`);

				fse.copySync('ecosystem.config.cjs', `${config.build.outDir}/ecosystem.config.cjs`);
				fse.copySync('package.json', `${config.build.outDir}/package.json`);
				await execa({ cwd: config.build.outDir })`npm pkg delete simple-git-hooks`;
				await execa({ cwd: config.build.outDir })`npm pkg delete lint-staged`;
				await execa({ cwd: config.build.outDir })`npm pkg delete devDependencies`;
				await execa({ cwd: config.build.outDir })`npm pkg delete scripts`;

				const scripts = {
					'start': 'cross-env NODE_ENV=production node server.js',
					'init-db': 'node db/init-db.js',
					'init-data': 'node db/init-data.js',
				};
				await execa({
					cwd: config.build.outDir,
				})`npm pkg set scripts=${JSON.stringify(scripts)} --json`;
			},

			async writeBundle(__options, bundle) {
				copyEjsFiles(bundle, config.build.outDir, hash);
			},
		},
	];
};
