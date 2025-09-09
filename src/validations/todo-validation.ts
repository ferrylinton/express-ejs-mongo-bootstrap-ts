import z from 'zod';

export const CreateTodoValidation = z.object({
	task: z.string().min(3, 'taskMin').max(150, 'taskMax'),
});
