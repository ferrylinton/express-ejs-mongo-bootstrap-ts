import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';
import postcssPresetEnv from 'postcss-preset-env';
import postcssImport from 'postcss-import';
import postcssNesting from 'postcss-nesting';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import discardComment from 'postcss-discard-comments';

export default {
	plugins: [
		autoprefixer(),
		postcssImport(),
		discardComment({ removeAll: true }),
		postcssNesting({
			noIsPseudoSelector: true,
		}),
		postcssPresetEnv({
			stage: 3,
			autoprefixer: { flexbox: 'no-2009' },
			features: {
				'nesting-rules': false,
			},
		}),
		process.env.NODE_ENV === 'production'
			? purgeCSSPlugin({
					content: ['./src/**/*.ejs', './src/**/*.css'],
					css: ['./src/**/*.css'],
					fontFace: true,
					keyframes: false,
					variables: false,
					safelist: [
						/data-bs-theme$/,
						/is-active$/,
						/^modal-/,
						/^offcanvas-/,
						':root',
						'show'
					],
				})
			: null,
		process.env.NODE_ENV === 'production' ? cssnano : null,
	].filter(Boolean),
};
