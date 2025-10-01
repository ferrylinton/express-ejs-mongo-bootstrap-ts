import { getCollection } from '@/config/mongodb-config';
import { logger } from '@/config/winston-config';
import { Pageable } from '@/types/common-type';
import { Message } from '@/types/message-type';
import { mapToObject } from '@/utils/json-util';
import { PAGE_SIZE } from '@/utils/pagination-util';
import { DeleteResult, ObjectId, UpdateResult, WithId } from 'mongodb';
import queryString from 'query-string';
import { stringify } from 'querystring';

export const MESSAGE_COLLECTION = 'messages';

export const findMessages = async (page: number = 1) => {
	page = page <= 0 ? 1 : page;
	const messageCollection = await getCollection<Message>(MESSAGE_COLLECTION);

	const pipeline = [
		{
			$sort: {
				createdAt: -1,
			},
		},
		{
			$facet: {
				data: [
					{
						$skip: (page - 1) * PAGE_SIZE,
					},
					{
						$limit: PAGE_SIZE,
					},
				],
				pagination: [
					{
						$count: 'total',
					},
				],
			},
		},
		{
			$unwind: '$pagination',
		},
	];

	logger.info('Message.find : ' + JSON.stringify(pipeline));
	const arr = await messageCollection.aggregate<Pageable<WithId<Message>>>(pipeline).toArray();
	const pageable =
		arr.length > 0
			? arr[0]
			: {
					data: [],
					pagination: {
						total: 0,
						totalPage: 0,
						page: 1,
						pageSize: 10,
					},
				};

	pageable.pagination.page = page;
	pageable.pagination.totalPage = Math.ceil(pageable.pagination.total / PAGE_SIZE);
	pageable.pagination.pageSize = PAGE_SIZE;
	pageable.pagination.firstRowNumber = (page - 1) * PAGE_SIZE + 1;

	pageable.data = pageable.data.map(message => {
		message.id = message._id.toHexString();
		return message;
	});

	if (page > 1 && pageable.pagination.totalPage > 1) {
		pageable.pagination.firstQueryString = stringify({
			page: 1,
		});
		pageable.pagination.previousQueryString = queryString.stringify({
			page: page - 1,
		});
	}

	if (page < pageable.pagination.totalPage && pageable.pagination.totalPage > 1) {
		pageable.pagination.nextQueryString = queryString.stringify({
			page: page + 1,
		});
		pageable.pagination.lastQueryString = queryString.stringify({
			page: pageable.pagination.totalPage,
		});
	}

	return pageable;
};

export const findMessageById = async (id: string): Promise<Message | null> => {
	if (!ObjectId.isValid(id)) {
		return null;
	}

	const messageCollection = await getCollection<Message>(MESSAGE_COLLECTION);
	const message = await messageCollection.findOne({ _id: new ObjectId(id) });

	if (message) {
		return mapToObject(message);
	}

	return null;
};

export const createMessage = async ({ email, message }: Omit<Message, 'id'>): Promise<Message> => {
	const messageCollection = await getCollection<Omit<Message, 'id'>>(MESSAGE_COLLECTION);

	const newMessage = {
		email,
		message,
		viewed: false,
		createdAt: new Date(),
	};

	const insertOneResult = await messageCollection.insertOne(newMessage);
	return { id: insertOneResult.insertedId.toHexString(), ...newMessage };
};

export const updateMessage = async (id: string, updatedBy: string): Promise<UpdateResult> => {
	const messageCollection = await getCollection<Omit<Message, 'id'>>(MESSAGE_COLLECTION);
	const current = await messageCollection.findOne({ _id: new ObjectId(id) });

	if (!current) {
		throw new Error(`Message [id='${id}'] is not found`);
	}

	const { _id, ...newData } = current;
	newData.viewed = true;
	newData.updatedBy = updatedBy;
	newData.updatedAt = new Date();

	return await messageCollection.updateOne({ _id: current._id }, { $set: newData });
};

export const deleteMessageById = async (id: string): Promise<DeleteResult> => {
	if (!ObjectId.isValid(id)) {
		return { acknowledged: false, deletedCount: 0 };
	}

	const messageCollection = await getCollection<Omit<Message, 'id'>>(MESSAGE_COLLECTION);
	return await messageCollection.deleteOne({ _id: new ObjectId(id) });
};
