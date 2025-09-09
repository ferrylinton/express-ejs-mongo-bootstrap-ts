import { APP_COOKIE_MAX_AGE, NODE_ENV } from '@/config/env-constant';
import { QueryParams } from '@/types/express-type';
import { Express, NextFunction, Request, Response } from 'express';
import i18n from 'i18n';
import path, { resolve } from 'path';

const BASE_FOLDER =
	NODE_ENV === 'production' ? resolve(process.cwd()) : resolve(process.cwd(), 'src');

export const COOKIE_LOCALE = 'locale';

export const LOCALES = ['id', 'en'];

export const DEFAULT_LOCALE = 'id';

i18n.configure({
	locales: LOCALES,
	defaultLocale: DEFAULT_LOCALE,

	// change 'accept-language' because browser always send 'accept-language'
	// Accept-Language: en-US,en;q=0.9 , depend on your browser setting
	header: 'x-accept-language',
	queryParameter: COOKIE_LOCALE,
	cookie: COOKIE_LOCALE,

	directory: path.join(BASE_FOLDER, 'locales'),
	autoReload: true,
	updateFiles: false,
	syncFiles: false,
	api: {
		__: 't',
		__n: 'tn',
	},
});

export const i18nConfig = (app: Express) => {
	app.use(i18n.init);

	app.use(
		(
			req: Request<unknown, unknown, unknown, QueryParams>,
			res: Response,
			next: NextFunction
		) => {
			if (req.cookies.locale === undefined) {
				res.cookie(COOKIE_LOCALE, req.getLocale(), {
					maxAge: APP_COOKIE_MAX_AGE,
					httpOnly: true,
				});
			}

			if (req.query.locale) {
				i18n.setLocale(req.query.locale);
				res.cookie(COOKIE_LOCALE, req.getLocale(), {
					maxAge: APP_COOKIE_MAX_AGE,
					httpOnly: true,
				});
			}

			next();
		}
	);
};
