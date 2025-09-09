import { getCollection } from '@/config/mongodb-config';
import { logger } from '@/config/winston-config';
import { Pageable } from '@/types/common-type';
import { Message } from '@/types/message-type';
import { mapToObject } from '@/utils/json-util';
import { PAGE_SIZE } from '@/utils/pagination-util';
import { DeleteResult, ObjectId, UpdateResult, WithId } from 'mongodb';

export const MESSAGE_COLLECTION = 'messages';

export const findMessages = async (keyword: string | null, page: number) => {
	page = page <= 0 ? 1 : page;
	const messageCollection = await getCollection<Message>(MESSAGE_COLLECTION);

	const pipeline = [
		{
			$match: {},
		},
		{
			$project: {
				message: 0,
			},
		},
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

	if (keyword) {
		const regex = new RegExp(keyword, 'i');
		pipeline[0]['$match'] = {
			$or: [{ email: regex }, { message: regex }],
		};

		logger.info('POST.find : ' + JSON.stringify(pipeline).replaceAll('{}', regex.toString()));
	} else {
		pipeline.shift();
		logger.info('POST.find : ' + JSON.stringify(pipeline));
	}

	const arr = await messageCollection.aggregate<Pageable<WithId<Message>>>(pipeline).toArray();

	if (arr.length && arr[0]) {
		if (keyword) {
			arr[0].keyword = keyword;
		}

		arr[0].pagination.page = page;
		arr[0].pagination.totalPage = Math.ceil(arr[0].pagination.total / PAGE_SIZE);
		arr[0].pagination.pageSize = PAGE_SIZE;

		arr[0].data = arr[0].data.map(message => {
			message.id = message._id.toHexString();
			return message;
		});

		return arr[0] as Pageable<Message>;
	}

	return {
		data: [],
		pagination: {
			total: 0,
			totalPage: 0,
			page: 1,
			pageSize: 10,
		},
		keyword,
	};
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
