import { logger } from '@/config/winston-config';
import { updateAuditTrail } from '@/services/audit-trail-service';
import { NextFunction, Request, Response } from 'express';

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
	logger.error(error);

	if (res.locals.requestId) {
		updateAuditTrail(res.locals.requestId, error.message).catch(logger.error);
	}

	res.render('error');
};
