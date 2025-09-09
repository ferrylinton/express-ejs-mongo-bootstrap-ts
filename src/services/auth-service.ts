import { LoggedUser } from '@/types/auth-type';
import bcrypt from 'bcryptjs';
import { findUserByEmail } from './user-service';

export const login = async (email: string, password: string): Promise<LoggedUser | string> => {
	const user = await findUserByEmail(email);

	if (user) {
		if (bcrypt.compareSync(password, user.password)) {
			if (user.locked) {
				return 'usernameIsLocked';
			}

			return user;
		}
	}

	return 'invalidUsernameOrPassword';
};
