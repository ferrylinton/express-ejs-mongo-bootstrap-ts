import { getCollection } from '@/config/mongodb-config';
import { logger } from '@/config/winston-config';
import { AuditTrail } from '@/types/audit-trail-type';
import { Pageable } from '@/types/common-type';
import { mapToObject } from '@/utils/json-util';
import { PAGE_SIZE } from '@/utils/pagination-util';
import { AuditTrailQuery } from '@/validations/search-validation';
import { ObjectId, WithId } from 'mongodb';
import queryString from 'query-string';
import { stringify } from 'querystring';

/**
 * A service that handles CRUD operations of AuditTrail's data
 * @author ferrylinton
 * @module AuditTrailService
 */

/** @typedef {import("mongodb").InsertOneResult} InsertOneResult */
/** @typedef {import("mongodb").UpdateResult} UpdateResult */
/** @typedef {import("mongodb").DeleteResult} DeleteResult */

/**
 * @typedef {Object} AuditTrail
 * @property {string} id - The Id
 * @property {string} task - The task
 * @property {boolean} done - The status of the task
 * @property {date} createdAt - Created date
 * @property {date|null} updatedAt - Updated date
 */

export const AUDIT_TRAIL_COLLECTION = 'audit_trails';

export const findAuditTrails = async ({ keyword, dateRange, page = 1 }: AuditTrailQuery) => {
	const auditTrailCollection = await getCollection(AUDIT_TRAIL_COLLECTION);

	const pipeline = [
		{
			$match: {},
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

	let dateFilter = {};

	if (dateRange?.startDate && dateRange?.endDate) {
		dateFilter = {
			$gte: dateRange.startDate,
			$lte: dateRange.endDate,
		};
	}

	if (keyword && dateRange?.startDate && dateRange?.endDate) {
		const regex = new RegExp(keyword, 'i');
		pipeline[0]['$match'] = {
			$and: [
				{ url: regex },
				{
					createdAt: dateFilter,
				},
			],
		};

		logger.info(
			'AuditTrail.find : ' + JSON.stringify(pipeline).replaceAll('{}', regex.toString())
		);
	} else if (!keyword && dateRange?.startDate && dateRange?.endDate) {
		pipeline[0]['$match'] = {
			createdAt: dateFilter,
		};

		logger.info('AuditTrail.find : ' + JSON.stringify(pipeline));
	} else if (keyword) {
		const regex = new RegExp(keyword, 'i');
		pipeline[0]['$match'] = { url: regex };

		logger.info(
			'AuditTrail.find : ' + JSON.stringify(pipeline).replaceAll('{}', regex.toString())
		);
	} else {
		pipeline.shift();
		logger.info('AuditTrail.find : ' + JSON.stringify(pipeline));
	}

	const arr = await auditTrailCollection
		.aggregate<Pageable<WithId<AuditTrail>>>(pipeline)
		.toArray();
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

	pageable.data = pageable.data.map(auditTrail => {
		auditTrail.id = auditTrail._id.toHexString();
		return auditTrail;
	});

	if (page > 1 && pageable.pagination.totalPage > 1) {
		pageable.pagination.firstQueryString = stringify({
			keyword,
			dateRange: dateRange?.dateRange,
			page: 1,
		});
		pageable.pagination.previousQueryString = queryString.stringify({
			keyword,
			dateRange: dateRange?.dateRange,
			page: page - 1,
		});
	}

	if (page < pageable.pagination.totalPage && pageable.pagination.totalPage > 1) {
		pageable.pagination.nextQueryString = queryString.stringify({
			keyword,
			dateRange: dateRange?.dateRange,
			page: page + 1,
		});
		pageable.pagination.lastQueryString = queryString.stringify({
			keyword,
			dateRange: dateRange?.dateRange,
			page: pageable.pagination.totalPage,
		});
	}

	return pageable;
};

export const countAuditTrailes = async (): Promise<number> => {
	const auditTrailCollection = await getCollection<AuditTrail>(AUDIT_TRAIL_COLLECTION);
	return await auditTrailCollection.countDocuments();
};

/**
 * Find a AuditTrail document by ID
 *
 * @param {string} id - The ID of auditTrail document
 * @returns A {@link AuditTrail} document
 */
export const findAuditTrailById = async (id: string) => {
	const auditTrailCollection = await getCollection<AuditTrail>(AUDIT_TRAIL_COLLECTION);
	const auditTrail = await auditTrailCollection.findOne({ _id: new ObjectId(id) });
	return auditTrail ? mapToObject(auditTrail) : null;
};

/**
 * Create a new AuditTrail document.
 *
 * @param {string} task - The task
 * @returns Object of {@link InsertOneResult}
 */
export const createAuditTrail = async (auditTrail: Omit<AuditTrail, 'id'>) => {
	const auditTrailCollection =
		await getCollection<Omit<AuditTrail, 'id'>>(AUDIT_TRAIL_COLLECTION);
	return await auditTrailCollection.insertOne(auditTrail);
};

/**
 * Update a auditTrail document in a collection
 *
 * @param {string} id - The ID of auditTrail document
 * @param {Object} updateData - The new data
 * @param {string} updateData.task - The new task
 * @param {boolean} updateData.done - The task status
 * @returns Object of {@link UpdateResult}.
 */
export const updateAuditTrail = async (requestId: string, error: any) => {
	const auditTrailCollection = await getCollection<AuditTrail>(AUDIT_TRAIL_COLLECTION);
	await auditTrailCollection.updateOne({ requestId }, { $set: { error } });
};

/**
 * Delete a auditTrail document from a collection.
 *
 * @param {string} id - The ID of auditTrail document
 * @returns Object of {@link DeleteResult}.
 */
export const deleteAuditTrailById = async (id: string) => {
	const auditTrailCollection = await getCollection<AuditTrail>(AUDIT_TRAIL_COLLECTION);
	return await auditTrailCollection.deleteOne({ _id: new ObjectId(id) });
};
