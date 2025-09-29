import { logger } from '@/config/winston-config';
import { auditTrail } from '@/middlewares/audit-trail';
import { createMessage, findMessages } from '@/services/message-service';
import { decrypt } from '@/utils/encrypt-util';
import { toastSuccess } from '@/utils/toast-util';
import { CreateMessageSchema } from '@/validations/message-validation';
import express, { NextFunction, Request, Response } from 'express';
import { treeifyError } from 'zod';

const viewMessageHandler = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		res.render('messages/message-create');
	} catch (error) {
		next(error);
	}
};

const viewMessageListHandler = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const pageable = await findMessages(null, 1);
		res.render('messages/message-list', { pageable });
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
					toast: { message: res.t('captchaIsExpired'), type: 'danger' },
					formData: req.body,
				});
			}

			const plainCaptcha = await decrypt(captchaFromCookies);

			if (plainCaptcha !== validation.data.captcha) {
				res.render('messages/message-create', {
					toast: { message: res.t('captchaIsNotMatch'), type: 'danger' },
					formData: req.body,
				});
			} else {
				const { message, email } = validation.data;
				await createMessage({ message, email });
				toastSuccess(res, res.t('messageIsSent'));
				res.redirect('/message');
			}
		} else {
			const errorValidations = treeifyError(validation.error).properties;
			res.status(400);
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

router.get('/message', auditTrail, viewMessageHandler);
router.post('/message', auditTrail, createMessageHandler);
router.get('/data/messages', auditTrail, viewMessageListHandler);

export default router;
