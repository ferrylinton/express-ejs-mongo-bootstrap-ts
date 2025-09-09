import { MESSAGE } from '@/config/app-constant';
import { TOAST_COOKIE_MAX_AGE } from '@/config/env-constant';
import { logger } from '@/config/winston-config';
import { createMessage } from '@/services/message-service';
import { decrypt } from '@/utils/encrypt-util';
import { CreateMessageSchema } from '@/validations/message-validation';
import express, { NextFunction, Request, Response } from 'express';
import { treeifyError } from 'zod';

const viewMessageHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		res.render('messages/message-create');
	} catch (error) {
		next(error);
	}
};

const createMessageHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const validation = CreateMessageSchema.safeParse(req.body);

		if (validation.success) {
			const captchaFromCookies = req.cookies['captcha'];

			if (!captchaFromCookies) {
				return res.render('messages/message-create', {
					message: res.t('captchaIsExpired'),
					formData: req.body,
				});
			}

			const plainCaptcha = await decrypt(captchaFromCookies);

			if (plainCaptcha !== validation.data.captcha) {
				res.render('messages/message-create', {
					message: res.t('captchaIsNotMatch'),
					formData: req.body,
				});
			} else {
				const { message, email } = validation.data;
				await createMessage({ message, email });

				res.cookie(MESSAGE, res.t('dataIsCreated'), {
					maxAge: TOAST_COOKIE_MAX_AGE,
					httpOnly: true,
				});

				res.redirect('/message');
			}
		} else {
			const errorValidations = treeifyError(validation.error).properties;
			res.render('messages/message-create', {
				formData: req.body,
				errorValidations,
			});
		}
	} catch (error) {
		logger.error(error);
		next(error);
	}
};

/**
 * Create instance of Express.Router
 */
const router = express.Router();

router.get('/message', viewMessageHandler);
router.post('/message', createMessageHandler);

export default router;
