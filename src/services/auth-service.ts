import { logger } from '@/config/winston-config';
import AuthError from '@/errors/auth-error';
import { findUserByUsername } from '@/services/user-service';
import { LoggedUser } from '@/types/user-type';
import { decrypt } from '@/utils/encrypt-util';
import bcrypt from 'bcryptjs';

export const authenticate = async (username: string, password: string): Promise<LoggedUser> => {
	const user = await findUserByUsername(username);

	if (user) {
		if (bcrypt.compareSync(password, user.password)) {
			if (user.locked) {
				throw new AuthError('usernameIsLocked');
			}

			const { id, username, email, role } = user;
			return { id, username, email, role };
		} else {
			throw new AuthError('invalidUsernameOrPassword');
		}
	} else {
		throw new AuthError('usernameIsNotFound');
	}
};

export const extractLoggedUser = async (encrypted: string | null) => {
	try {
		if (encrypted) {
			const decrypted = await decrypt(encrypted);
			const loggedUser: LoggedUser = JSON.parse(decrypted || '');

			if (loggedUser && loggedUser.username && loggedUser.role) {
				return loggedUser;
			}
		}
	} catch (error) {
		logger.error(error);
	}

	return null;
};
