import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
	status?: number;
}

export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
	console.error(err);
	res.render('error');
};
