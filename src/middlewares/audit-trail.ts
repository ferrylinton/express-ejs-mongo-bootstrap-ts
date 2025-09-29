import { logger } from '@/config/winston-config';
import { createAuditTrail } from '@/services/audit-trail-service';
import { AuditTrail } from '@/types/audit-trail-type';
import { NextFunction, Request, Response } from 'express';
import maskdata from 'maskdata';

const jsonMaskConfig = {
	passwordFields: ['password'],
};

export const logAuditTrail = (req: Request, res: Response) => {
	if (res.locals.requestId) {
		return new Promise<void>((resolve, reject) => {
			try {
				const auditTrail: Omit<AuditTrail, 'id' | 'createdAt'> = {
					requestId: res.locals.requestId,
					url: req.originalUrl,
					method: req.method,
					params: Object.keys(req.params).length !== 0 ? req.params : undefined,
					query: Object.keys(req.query).length !== 0 ? req.query : undefined,
					payload: maskdata.maskJSON2(req.body, jsonMaskConfig),
				};

				createAuditTrail({
					createdAt: new Date(),
					...JSON.parse(JSON.stringify(auditTrail)),
				});
				logger.info(auditTrail);
				resolve();
			} catch (error) {
				reject(error);
			}
		});
	}
};

export const auditTrail = async (req: Request, res: Response, next: NextFunction) => {
	logAuditTrail(req, res)?.catch(logger.error);
	next();
};
