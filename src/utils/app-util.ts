import { APP_COOKIE_MAX_AGE } from '@/config/env-constant';
import { COOKIE_LOCALE, DEFAULT_LOCALE, LOCALES } from '@/config/i18n-config';
import { logger } from '@/config/winston-config';
import { QueryParams } from '@/types/express-type';
import { Request, Response } from 'express';
import { readdirSync } from 'fs';
import path from 'path';

export const COOKIE_VARIANT = 'variant';
export const DEFAULT_VARIANT = 'default';
export const VARIANTS = ['default', 'darkly'];

export const COOKIE_THEME = 'theme';
export const DEFAULT_THEME = 'light';
export const THEMES = ['light', 'dark'];

let cssFolder = '';

if (import.meta.env?.PROD) cssFolder = path.join(__dirname, 'assets', 'css');
else cssFolder = path.join(import.meta.dirname, '../assets', 'css');

export const initTheme = (req: Request<unknown, unknown, unknown, QueryParams>, res: Response) => {
	try {
		if (req.query.theme && THEMES.includes(req.query.theme)) {
			res.cookie(COOKIE_THEME, req.query.theme, {
				maxAge: APP_COOKIE_MAX_AGE,
				httpOnly: true,
			});
			res.locals.theme = req.query.theme;
		} else if (req.cookies[COOKIE_THEME] === undefined) {
			res.cookie(COOKIE_THEME, DEFAULT_THEME, {
				maxAge: APP_COOKIE_MAX_AGE,
				httpOnly: true,
			});
			res.locals.theme = DEFAULT_THEME;
		} else {
			res.locals.theme = req.cookies[COOKIE_THEME];
		}
	} catch (error) {
		logger.error(error);
	}
};

export const initVariant = (
	req: Request<unknown, unknown, unknown, QueryParams>,
	res: Response
) => {
	try {
		const { variants, names } = getBootstrapVariants();
		let variantName = DEFAULT_VARIANT;

		if (req.query.variant && names.includes(req.query.variant)) {
			variantName = req.query.variant;
		} else if (req.cookies[COOKIE_VARIANT] && names.includes(req.cookies[COOKIE_VARIANT])) {
			variantName = req.cookies[COOKIE_VARIANT];
		}

		res.cookie(COOKIE_VARIANT, variantName, {
			maxAge: APP_COOKIE_MAX_AGE,
			httpOnly: true,
		});
		const arr = variants.filter(variant => variant.name === variantName);
		res.locals.bootstrapVariant = arr.length > 0 ? arr[0] : null;
	} catch (error) {
		logger.error(error);
	}
};

export const initLocale = (req: Request<unknown, unknown, unknown, QueryParams>, res: Response) => {
	try {
		if (req.query.locale && LOCALES.includes(req.query.locale)) {
			res.cookie(COOKIE_LOCALE, req.query.locale, {
				maxAge: APP_COOKIE_MAX_AGE,
				httpOnly: true,
			});
			res.locals.locale = req.query.locale;
		} else if (req.cookies[COOKIE_LOCALE] === undefined) {
			res.cookie(COOKIE_LOCALE, DEFAULT_LOCALE, {
				maxAge: APP_COOKIE_MAX_AGE,
				httpOnly: true,
			});
			res.locals.locale = DEFAULT_LOCALE;
		} else {
			res.locals.locale = req.cookies[COOKIE_LOCALE];
		}
	} catch (error) {
		logger.error(error);
	}
};

export const getBootstrapVariants = () => {
	const variants: Record<string, string>[] = [];
	const names: string[] = [];
	const currentDate = new Date().getTime();

	try {
		readdirSync(cssFolder)
			.filter(file => file.startsWith('bootstrap-'))
			.forEach(file => {
				const arr = file.split('-');
				const name = arr.length > 0 ? arr[1].replace('.css', '') : file;

				names.push(name);

				if (import.meta.env?.PROD)
					variants.push({
						name,
						url: `/assets/css/${file}`,
					});
				else
					variants.push({
						name,
						url: `/assets/css/${file}?t=${currentDate}`,
					});
			});
	} catch (error) {
		logger.error(error);
	}

	return { variants, names };
};
