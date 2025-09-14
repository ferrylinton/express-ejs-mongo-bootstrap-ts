import { TOAST } from '@/config/app-constant';
import { TOAST_COOKIE_MAX_AGE } from '@/config/env-constant';
import { logger } from '@/config/winston-config';
import { QueryParams } from '@/types/express-type';
import { Toast } from '@/types/toast-type';
import { Request, Response } from 'express';

export const initToast = (req: Request<unknown, unknown, unknown, QueryParams>, res: Response) => {
	try {
		if (req.cookies[TOAST]) {
			const toast = JSON.parse(req.cookies[TOAST]) as Toast;
			res.locals[TOAST] = toast;
			res.cookie(TOAST, '', { expires: new Date(0) });
		}
	} catch (error) {
		logger.error(error);
	}
};

export const toastSuccess = (res: Response, message: string) => {
	try {
		res.cookie(TOAST, JSON.stringify({ message, type: 'success' }), {
			maxAge: TOAST_COOKIE_MAX_AGE,
			httpOnly: true,
		});
	} catch (error) {
		logger.error(error);
	}
};

export const toastDanger = (res: Response, message: string) => {
	try {
		res.cookie(TOAST, JSON.stringify({ message, type: 'danger' }), {
			maxAge: TOAST_COOKIE_MAX_AGE,
			httpOnly: true,
		});
	} catch (error) {
		logger.error(error);
	}
};
