import { Request, Response, NextFunction } from 'express';

export const scriptInjectorMiddleware = (scriptToInject: string) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const originalSend = res.send;

		res.send = function (body?: any): Response {
			if (typeof body === 'string' && body.includes('</body>')) {
				const modifiedBody = body.replace('</body>', `${scriptToInject}</body>`);
				return originalSend.call(this, modifiedBody);
			}

			return originalSend.call(this, body);
		};

		next();
	};
};

export const cssInjectorMiddleware = (cssToInject: string) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const originalSend = res.send;

		res.send = function (body?: any): Response {
			if (typeof body === 'string' && body.includes('<body>')) {
				const modifiedBody = body.replace('<body>', `${cssToInject}<body>`);
				return originalSend.call(this, modifiedBody);
			}

			return originalSend.call(this, body);
		};

		next();
	};
};
