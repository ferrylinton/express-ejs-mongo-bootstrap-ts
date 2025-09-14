import { existsSync } from 'fs';
import { resolve } from 'path';

const APP_DEV_PATH = resolve(process.cwd(), 'src');

export const APP_PATH = existsSync(APP_DEV_PATH) ? APP_DEV_PATH : process.cwd();

export const PAGE_SIZE = 10;

export const TOAST = 'toast';

export const LOGGED_USER = 'LOGGED_USER';
