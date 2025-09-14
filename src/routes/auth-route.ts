import { LOGGED_USER } from '@/config/app-constant';
import { AUTH_COOKIE_MAX_AGE } from '@/config/env-constant';
import { logger } from '@/config/winston-config';
import AuthError from '@/errors/auth-error';
import { authenticate } from '@/services/auth-service';
import { createUser } from '@/services/user-service';
import { decrypt, encrypt } from '@/utils/encrypt-util';
import { toastSuccess } from '@/utils/toast-util';
import { LoginValidation, RegisterValidation } from '@/validations/auth-validation';
import express, { NextFunction, Request, Response } from 'express';
import { treeifyError } from 'zod';

const viewLogin = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		res.render('login');
	} catch (error) {
		next(error);
	}
};

const postLogin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const validation = LoginValidation.safeParse(req.body);

		if (validation.success) {
			const captchaFromCookies = req.cookies['captcha'];

			if (!captchaFromCookies) {
				return res.render('login', {
					toast: { message: res.t('captchaIsExpired'), type: 'danger' },
					formData: req.body,
				});
			}

			const plainCaptcha = await decrypt(captchaFromCookies);
			if (plainCaptcha !== validation.data.captcha) {
				res.render('login', {
					toast: { message: res.t('captchaIsNotMatch'), type: 'danger' },
					formData: req.body,
				});
			} else {
				const { username, password } = validation.data;
				const loggedUser = await authenticate(username, password);
				const encrypted = await encrypt(JSON.stringify(loggedUser));
				res.cookie(LOGGED_USER, encrypted, {
					maxAge: AUTH_COOKIE_MAX_AGE,
					httpOnly: true,
				});

				res.redirect('/profile');
			}
		} else {
			const errorValidations = treeifyError(validation.error).properties;
			res.render('login', {
				formData: req.body,
				errorValidations,
			});
		}
	} catch (error) {
		logger.error(error);

		if (error instanceof AuthError) {
			const authError = error as AuthError;
			res.render('login', {
				toast: { message: res.t(authError.message), type: 'danger' },
				formData: req.body,
			});
		} else {
			next(error);
		}
	}
};

const postLogout = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		res.cookie(LOGGED_USER, '', { expires: new Date(0) });
		res.redirect('/login');
	} catch (error) {
		next(error);
	}
};

const viewRegister = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		res.render('register');
	} catch (error) {
		next(error);
	}
};

const postRegister = async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const validation = RegisterValidation.safeParse(req.body);

		if (validation.success) {
			const captchaFromCookies = req.cookies['captcha'];

			if (!captchaFromCookies) {
				return res.render('register', {
					toast: { message: res.t('captchaIsExpired'), type: 'danger' },
					formData: req.body,
				});
			}

			const plainCaptcha = await decrypt(captchaFromCookies);

			if (plainCaptcha !== validation.data.captcha) {
				res.render('register', {
					toast: { message: res.t('captchaIsNotMatch'), type: 'danger' },
					formData: req.body,
				});
			} else {
				const { username, email, password } = validation.data;
				await createUser({ role: 'USER', username, email, password });
				toastSuccess(res, res.t('dataIsCreated'));
				res.redirect('/register');
			}
		} else {
			const errorValidations = treeifyError(validation.error).properties;
			res.render('register', {
				formData: req.body,
				errorValidations,
			});
		}
	} catch (error: any) {
		logger.error(error);
		const message = error.message;
		res.render('register', {
			message,
			messageType: 'error',
			formData: req.body,
		});
	}
};

/**
 * Create instance of Express.Router
 */
const router = express.Router();

router.get('/login', viewLogin);

router.post('/login', postLogin);

router.post('/logout', postLogout);

router.get('/register', viewRegister);

router.post('/register', postRegister);

export default router;
