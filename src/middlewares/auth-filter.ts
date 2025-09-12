import { LOGGED_USER, MESSAGE } from '@/config/app-constant';
import { TOAST_COOKIE_MAX_AGE } from '@/config/env-constant';
import { logger } from '@/config/winston-config';
import { extractLoggedUser } from '@/services/auth-service';
import { getClientIp } from '@/utils/request-util';
import { NextFunction, Request, Response } from 'express';


const publicUrlRegex = /login|register|about|author|message|captcha/;

export const authFilter = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (publicUrlRegex.test(req.path)) {
			const ip = getClientIp(req);
			console.log(ip);
			logger.info(`${req.path} public url`);
			next();
		} else {
			const loggedUser = await extractLoggedUser(req.cookies[LOGGED_USER]);

			if (loggedUser) {
				req.loggedUser = loggedUser;
				res.locals.loggedUser = loggedUser;
				console.log(loggedUser);
				next();
			} else {
				res.cookie(LOGGED_USER, '', { expires: new Date(0) });
				res.cookie(MESSAGE, res.t('notLoggedIn'), {
					maxAge: TOAST_COOKIE_MAX_AGE,
					httpOnly: true,
				});
				return res.redirect('/login');
			}
		}
	} catch (error) {
		logger.error(error);
		next(error);
	}
};
