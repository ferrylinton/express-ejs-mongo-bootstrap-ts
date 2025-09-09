import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.MONGODB_URL) {
	throw new Error('Invalid environment variable: "MONGODB_URL"');
}

if (!process.env.MONGODB_AUTH_SOURCE) {
	throw new Error('Invalid environment variable: "MONGODB_AUTH_SOURCE"');
}

if (!process.env.MONGODB_USERNAME) {
	throw new Error('Invalid environment variable: "MONGODB_USERNAME"');
}

if (!process.env.MONGODB_PASSWORD) {
	throw new Error('Invalid environment variable: "MONGODB_PASSWORD"');
}

if (!process.env.MONGODB_DATABASE) {
	throw new Error('Invalid environment variable: "MONGODB_DATABASE"');
}

export const port = Number(process.env.PORT) || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const LOGGER_LEVEL = process.env.LOGGER_LEVEL || 'warn';
export const LOGGER_HIDE_CONSOLE = process.env.LOGGER_HIDE_CONSOLE || 'true';

export const MONGODB_URL = process.env.MONGODB_URL;
export const MONGODB_AUTH_SOURCE = process.env.MONGODB_AUTH_SOURCE;
export const MONGODB_USERNAME = process.env.MONGODB_USERNAME;
export const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
export const MONGODB_DATABASE = process.env.MONGODB_DATABASE;

export const APP_NAME = process.env.APP_NAME || 'TODO';

export const COOKIE_SECRET = process.env.COOKIE_SECRET || 'ferrylinton';

export const APP_COOKIE_MAX_AGE = parseInt(process.env.APP_COOKIE_MAX_AGE || '2592000') * 1000;

export const TOAST_COOKIE_MAX_AGE = parseInt(process.env.TOAST_COOKIE_MAX_AGE || '5') * 1000;

export const CAPTCHA_COOKIE_MAX_AGE = parseInt(process.env.CAPTCHA_COOKIE_MAX_AGE || '300') * 1000;

export const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '300');

export const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "100");
