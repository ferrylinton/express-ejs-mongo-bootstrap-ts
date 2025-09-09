import express, { NextFunction, Request, Response } from 'express';

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

router.get('/about', viewAbout);

router.get('/author', viewAuthor);

export default router;
