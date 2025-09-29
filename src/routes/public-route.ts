import { auditTrail } from '@/middlewares/audit-trail';
import express, { NextFunction, Request, Response } from 'express';

const viewHome = async (req: Request, res: Response, next: NextFunction) => {
	try {
		res.render('home');
	} catch (error) {
		next(error);
	}
};

const viewAbout = async (req: Request, res: Response, next: NextFunction) => {
	try {
		res.render('about');
	} catch (error) {
		next(error);
	}
};

const viewAuthor = async (req: Request, res: Response, next: NextFunction) => {
	try {
		res.render('author');
	} catch (error) {
		next(error);
	}
};

/**
 * Create instance of Express.Router
 */
const router = express.Router();

router.get('/', auditTrail, viewHome);

router.get('/about', auditTrail, viewAbout);

router.get('/author', auditTrail, viewAuthor);

export default router;
