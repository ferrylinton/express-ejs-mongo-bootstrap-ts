import { RATE_LIMIT_MAX } from '@/config/env-constant';
import { logger } from '@/config/winston-config';
import { incrementRateCount } from '@/services/rate-limit-service';
import { getClientIp } from '@/utils/request-util';
import { NextFunction, Request, Response } from 'express';

const hasDataRequest = (req: Request) => {
	if (
		req.path.endsWith('429') ||
		req.path.endsWith('.json') ||
		req.path.endsWith('.css') ||
		req.path.endsWith('.js') ||
		req.path.endsWith('.ts')
	) {
		return false;
	}

	return true;
};

export const rateLimit = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (hasDataRequest(req)) {
			const ip = getClientIp(req);
			const count = await incrementRateCount(ip);
			logger.info(`request count for ${ip} is ${count} `);
			if (count > RATE_LIMIT_MAX) {
				return res.redirect('/429');
			}
		}
	} catch (error) {
		logger.error(error);
		next(error);
	}

	next();
};
