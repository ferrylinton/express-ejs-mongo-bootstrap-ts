import { object, string, z } from 'zod';

const RoleTypeSchema = z.union([z.literal('ADMIN'), z.literal('USER')], {
	message: 'invalid.role',
});

const LockedSchema = z
	.union([z.literal('true'), z.literal('false')], {
		message: 'invalid.locked',
	})
	.transform(value => value === 'true');

export const CreateUserValidation = object({
	username: string().min(3, 'invalidUsername').max(20, 'invalidUsername'),
	email: z.email({ message: 'invalidEmail' }).max(50, 'invalidEmail'),
	password: string().min(6, 'invalidPassword').max(30, 'invalidPassword'),
	confirmPassword: string().min(6, 'invalidConfirmPassword').max(30, 'invalidConfirmPassword'),
	role: RoleTypeSchema,
}).refine(data => data.password === data.confirmPassword, {
	path: ['confirmPassword'],
	message: 'confirmPasswordNotMatch',
});

export const ChangePasswordValidation = object({
	username: string().min(3, 'invalidUsername').max(20, 'invalidUsername'),
	password: string().min(6, 'invalidPassword').max(30, 'invalidPassword'),
	confirmPassword: string().min(6, 'invalidConfirmPassword').max(30, 'invalidConfirmPassword'),
}).refine(data => data.password === data.confirmPassword, {
	path: ['confirmPassword'],
	message: 'confirmPasswordNotMatch',
});

export const UpdateUserValidation = object({
	username: string().min(3, 'invalidUsername').max(20, 'invalidUsername'),
	email: z.email({ message: 'invalidEmail' }).max(50, 'invalidEmail'),
	role: RoleTypeSchema,
	locked: LockedSchema,
}).partial();
