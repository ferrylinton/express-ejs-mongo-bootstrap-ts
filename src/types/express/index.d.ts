import { Role } from '../user-type';

// to make the file a module and avoid the TypeScript error
export {};

declare global {
	namespace Express {
		export interface Request {
			id: string;
			loggedUser: {
				id: string;
				username: string;
				role: Role;
			};
		}
		interface Response {
			t(phraseOrOptions: string | i18n.TranslateOptions, ...replace: string[]): string;
			t(
				phraseOrOptions: string | i18n.TranslateOptions,
				replacements: i18n.Replacements
			): string;
		}
	}
}
