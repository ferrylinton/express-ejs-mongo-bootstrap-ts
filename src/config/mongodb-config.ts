import {
	MONGODB_AUTH_SOURCE,
	MONGODB_DATABASE,
	MONGODB_PASSWORD,
	MONGODB_URL,
	MONGODB_USERNAME,
} from '@/config/env-constant';
import { serverLogger } from '@/config/winston-config';
import {
	ConnectionPoolMonitoringEvent,
	Db,
	type Document,
	MongoClient,
	type MongoClientOptions,
	type TransactionOptions,
} from 'mongodb';

const mongoClientOptions: MongoClientOptions = {
	authMechanism: 'DEFAULT',
	authSource: MONGODB_AUTH_SOURCE,
	monitorCommands: true,
	connectTimeoutMS: 15000,
	socketTimeoutMS: 15000,
	auth: {
		username: MONGODB_USERNAME,
		password: MONGODB_PASSWORD,
	},
};

export const transactionOptions: TransactionOptions = {
	readConcern: { level: 'snapshot' },
	writeConcern: { w: 'majority' },
	readPreference: 'primary',
};

/**
 * @type {Promise<MongoClient>}
 */
let mongoClient: Promise<MongoClient>;

const log = (event: ConnectionPoolMonitoringEvent) => {
	try {
		serverLogger.info(
			JSON.stringify(event, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
		);
	} catch (error) {
		serverLogger.error(error);
	}
};

const getMongoClientInstance = () => {
	const instance = new MongoClient(MONGODB_URL, mongoClientOptions);

	instance.on('connectionPoolCreated', log);

	instance.on('connectionPoolReady', log);

	instance.on('connectionCreated', log);

	instance.on('connectionClosed', log);

	return instance;
};

export const getMongoClient = async () => {
	if (mongoClient) {
		return mongoClient;
	} else {
		try {
			mongoClient = getMongoClientInstance().connect();
		} catch (error) {
			serverLogger.error(error);
		}

		return mongoClient;
	}
};

export const getDb = async () => {
	const connection = await getMongoClient();
	return connection.db(MONGODB_DATABASE);
};

export const getCollection = async <TSchema extends Document = Document>(name: string, db?: Db) => {
	if (db) {
		return db.collection<TSchema>(name);
	} else {
		const db = await getDb();
		return db.collection<TSchema>(name);
	}
};
