import { MONGODB_DATABASE } from '@/config/env-constant';
import { getMongoClient } from '@/config/mongodb-config';
import { logger } from '@/config/winston-config';
import { createPasswordTokenSchema } from '@/db/password-token-schema';
import { createRateLimitSchema } from '@/db/rate-limit-schema';
import { createTodoSchema } from '@/db/todo-schema';
import { createUserSchema } from '@/db/user-schema';
import { PASSWORD_TOKEN_COLLECTION } from '@/services/password-token-service';
import { RATE_LIMIT_COLLECTION } from '@/services/rate-limit-service';
import { TODO_COLLECTION } from '@/services/todo-service';
import { USER_COLLECTION } from '@/services/user-service';

export const initDb = async () => {
	logger.info('[MONGODB] initDb started...');

	try {
		// Create connection
		const connection = await getMongoClient();
		const db = connection.db(MONGODB_DATABASE);

		// Get existing collections
		const collections = await db.listCollections().toArray();
		const collectionNames = collections.map(c => c.name);

		// Create collections if not exist

		if (!collectionNames.includes(USER_COLLECTION)) {
			await createUserSchema(db);
		}
		if (!collectionNames.includes(TODO_COLLECTION)) {
			await createTodoSchema(db);
		}
		if (!collectionNames.includes(RATE_LIMIT_COLLECTION)) {
			await createRateLimitSchema(db);
		}

		if (!collectionNames.includes(PASSWORD_TOKEN_COLLECTION)) {
			await createPasswordTokenSchema(db);
		}
	} catch (error) {
		logger.error(error);
	} finally {
		logger.info('[MONGODB] initDb finished...');
		setTimeout(function () {
			process.exit();
		}, 500);
	}
};

await initDb();
