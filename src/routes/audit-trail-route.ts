import { findAuditTrails } from '@/services/audit-trail-service';
import { AuditTrailQuerySchema } from '@/validations/search-validation';
import express, { NextFunction, Request, Response } from 'express';

const viewListHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const validation = AuditTrailQuerySchema.safeParse(req.query);
		const params = validation.data || {};
		const { data, pagination } = await findAuditTrails(params);
		res.render('audittrails/audittrail-list', { ...params.dateRange, data, pagination });
	} catch (error) {
		next(error);
	}
};

const router = express.Router();

router.get('/data/audittrails', viewListHandler);

export default router;
