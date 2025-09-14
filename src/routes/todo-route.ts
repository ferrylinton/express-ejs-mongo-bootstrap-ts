import { logger } from '@/config/winston-config';
import {
	countTodoes,
	createTodo,
	deleteTodoById,
	findTodoById,
	findTodoes,
	updateTodo,
} from '@/services/todo-service';
import { toastSuccess } from '@/utils/toast-util';
import { CreateTodoValidation } from '@/validations/todo-validation';
import express, { NextFunction, Request, Response } from 'express';
import { treeifyError } from 'zod';

const viewListHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const todoes = await findTodoes();
		const total = await countTodoes();
		res.render('todoes/todo-list', { todoes, total });
	} catch (error) {
		next(error);
	}
};

const viewDetailHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id: string = req.params.id;
		const todo = await findTodoById(id);
		res.render('todoes/todo-detail', { todo });
	} catch (error) {
		next(error);
	}
};

const viewCreateHandler = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		res.render('todoes/todo-create');
	} catch (error) {
		next(error);
	}
};

const createTodoHandler = async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const total = await countTodoes();

		if (total >= 20) {
			res.render('todoes/todo-create', {
				formData: req.body,
				toast: { message: res.t('errorMaxData'), type: 'danger' },
			});
		} else {
			const validation = CreateTodoValidation.safeParse(req.body);

			if (validation.success) {
				await createTodo(validation.data.task);
				toastSuccess(res, res.t('dataIsCreated'));
				res.redirect('/');
			} else {
				const errorValidations = treeifyError(validation.error).properties;
				res.render('todoes/todo-create', {
					formData: req.body,
					errorValidations,
				});
			}
		}
	} catch (error: any) {
		logger.error(error);

		const message = (error.message as string).includes('duplicate')
			? res.t('duplicateData', req.body.task)
			: error.message;

		res.render('todoes/todo-create', {
			formData: req.body,
			toast: { message, type: 'danger' },
		});
	}
};

const viewUpdateHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id: string = req.params.id;
		const todo = await findTodoById(id);
		res.render('todoes/todo-update', {
			id,
			formData: todo,
		});
	} catch (error) {
		next(error);
	}
};

const updateTodoHandler = async (req: Request, res: Response, _next: NextFunction) => {
	const id: string = req.params.id;

	try {
		const validation = CreateTodoValidation.safeParse(req.body);

		if (validation.success) {
			await updateTodo(id, validation.data.task, req.body.done === 'on');
			toastSuccess(res, res.t('dataIsUpdated', validation.data.task));
			res.redirect('/');
		} else {
			const errorValidations = treeifyError(validation.error).properties;
			res.render('todoes/todo-update', {
				id,
				formData: req.body,
				errorValidations,
			});
		}
	} catch (error: any) {
		logger.error(error);
		const message = (error.message as string).includes('duplicate')
			? res.t('duplicateData', req.body.task)
			: error.message;
		res.render('todoes/todo-update', {
			id,
			formData: req.body,
			toast: { message, type: 'danger' },
		});
	}
};

const deleteTodoHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id: string = req.params.id;
		const current = await findTodoById(id);

		if (current) {
			await deleteTodoById(id);
			toastSuccess(res, res.t('dataIsDeleted', current.task));
		}

		res.status(200).json({ message: 'OK' });
	} catch (error) {
		next(error);
	}
};

const toggleStatusHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id: string = req.params.id;
		const current = await findTodoById(id);

		if (current) {
			await updateTodo(id, current.task, !current.done);
			toastSuccess(res, res.t('dataIsUpdated', current.task));
		}

		res.status(200).json({ message: 'OK' });
	} catch (error) {
		next(error);
	}
};

/**
 * Create instance of Express.Router
 */
const router = express.Router();

router.get('/', viewListHandler);
router.get('/todoes/detail/:id', viewDetailHandler);

router.get('/todoes/create', viewCreateHandler);
router.post('/todoes/create', createTodoHandler);

router.get('/todoes/update/:id', viewUpdateHandler);
router.post('/todoes/update/:id', updateTodoHandler);
router.put('/api/todoes/:id', toggleStatusHandler);

router.delete('/api/todoes/:id', deleteTodoHandler);

export default router;
