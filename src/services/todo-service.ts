import { getCollection } from '@/config/mongodb-config';
import { Todo } from '@/types/todo-type';
import { mapToObject } from '@/utils/json-util';
import { ObjectId } from 'mongodb';

/**
 * A service that handles CRUD operations of Todo's data
 * @author ferrylinton
 * @module TodoService
 */

/** @typedef {import("mongodb").InsertOneResult} InsertOneResult */
/** @typedef {import("mongodb").UpdateResult} UpdateResult */
/** @typedef {import("mongodb").DeleteResult} DeleteResult */

/**
 * @typedef {Object} Todo
 * @property {string} id - The Id
 * @property {string} task - The task
 * @property {boolean} done - The status of the task
 * @property {date} createdAt - Created date
 * @property {date|null} updatedAt - Updated date
 */

export const TODO_COLLECTION = 'todoes';

/**
 * Find multiple Todo documents
 *
 * @returns Array of {@link Todo} documetns.
 *
 */
export const findTodoes = async (): Promise<Todo[]> => {
	const todoCollection = await getCollection<Todo>(TODO_COLLECTION);
	const todoes = await todoCollection.find().sort({ createdAt: -1 }).toArray();
	return todoes.map(todo => mapToObject(todo));
};

export const countTodoes = async (): Promise<number> => {
	const todoCollection = await getCollection<Todo>(TODO_COLLECTION);
	return await todoCollection.countDocuments();
};

/**
 * Find a Todo document by ID
 *
 * @param {string} id - The ID of todo document
 * @returns A {@link Todo} document
 */
export const findTodoById = async (id: string) => {
	const todoCollection = await getCollection<Todo>(TODO_COLLECTION);
	const todo = await todoCollection.findOne({ _id: new ObjectId(id) });
	return todo ? mapToObject(todo) : null;
};

/**
 * Create a new Todo document.
 *
 * @param {string} task - The task
 * @returns Object of {@link InsertOneResult}
 */
export const createTodo = async (task: string) => {
	const todo: Omit<Todo, 'id'> = {
		task,
		done: false,
		createdAt: new Date(),
	};
	const todoCollection = await getCollection<Omit<Todo, 'id'>>(TODO_COLLECTION);
	return await todoCollection.insertOne(todo);
};

/**
 * Update a todo document in a collection
 *
 * @param {string} id - The ID of todo document
 * @param {Object} updateData - The new data
 * @param {string} updateData.task - The new task
 * @param {boolean} updateData.done - The task status
 * @returns Object of {@link UpdateResult}.
 */
export const updateTodo = async (id: string, task: string, done: boolean = true) => {
	const todoCollection = await getCollection<Todo>(TODO_COLLECTION);
	const updatedAt = new Date();
	return await todoCollection.updateOne(
		{ _id: new ObjectId(id) },
		{ $set: { task, done, updatedAt } }
	);
};

/**
 * Delete a todo document from a collection.
 *
 * @param {string} id - The ID of todo document
 * @returns Object of {@link DeleteResult}.
 */
export const deleteTodoById = async (id: string) => {
	const todoCollection = await getCollection<Todo>(TODO_COLLECTION);
	return await todoCollection.deleteOne({ _id: new ObjectId(id) });
};
