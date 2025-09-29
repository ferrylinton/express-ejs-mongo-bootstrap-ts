import { auditTrail } from '@/middlewares/audit-trail';
import express, { NextFunction, Request, Response } from 'express';

const viewProfile = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		res.render('profile');
	} catch (error) {
		next(error);
	}
};

/**
 * Create instance of Express.Router
 */
const router = express.Router();

router.get('/profile', auditTrail, viewProfile);

export default router;
