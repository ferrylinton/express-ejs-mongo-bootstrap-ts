import { APP_PATH } from '@/config/app-constant';
import { NODE_ENV } from '@/config/env-constant';
import { i18nConfig } from '@/config/i18n-config';
import { authFilter } from '@/middlewares/auth-filter';
import { errorHandler } from '@/middlewares/error-handler';
import { rateLimit } from '@/middlewares/rate-limit';
import authRoute from '@/routes/auth-route';
import captchaRoute from '@/routes/captcha-route';
import messageRoute from '@/routes/message-route';
import publicRoute from '@/routes/public-route';
import todoRoute from '@/routes/todo-route';
import { QueryParams } from '@/types/express-type';
import { getBootstrapVariants, initLocale, initTheme, initToast, initVariant } from '@/utils/app-util';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import favicon from 'express-favicon';
import path from 'path';

export const app = express();
app.set('trust proxy', 1);

app.use(compression());
app.use(cookieParser());
i18nConfig(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(favicon(path.join(APP_PATH, 'favicon.ico')));
app.set('views', path.join(APP_PATH, 'views'));
app.use('/assets', express.static(path.join(APP_PATH, 'assets')));

app.use(
	(req: Request<unknown, unknown, unknown, QueryParams>, res: Response, next: NextFunction) => {
		try {
			const { variants } = getBootstrapVariants();
			res.locals.currentPath = req.path;
			res.locals.NODE_ENV = NODE_ENV;
			res.locals.bootstrapVariants = variants;

			initLocale(req, res);
			initVariant(req, res);
			initTheme(req, res);
			initToast(req, res);

			next();
		} catch (error) {
			next(error);
		}
	}
);

// Middlewares
app.use(rateLimit);
app.use(authFilter);

// Routes
app.use('/', publicRoute);
app.use('/', authRoute);
app.use('/', messageRoute);
app.use('/', todoRoute);
app.use('/', captchaRoute);

app.use('/429', function (_req, res, _next) {
	res.status(429).render('429');
});

app.use(function (_req, res, _next) {
	res.status(404).render('404');
});

// Global error handler (should be after routes)
app.use(errorHandler);
