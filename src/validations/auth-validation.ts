import z from 'zod';

export const LoginValidation = z.object({
	username: z.string().min(3, 'invalid.username').max(20, 'invalid.username'),
	password: z.string().min(6, 'invalid.password').max(30, 'invalid.password'),
	captcha: z
		.string({ message: 'invalid.captcha' })
		.min(5, 'invalid.captcha')
		.max(5, 'invalid.captcha'),
});

export const RegisterValidation = z
	.object({
		username: z.string().min(3, 'invalid.username').max(20, 'invalid.username'),
		email: z.email({ message: 'invalid.email' }).max(50, 'invalid.email'),
		password: z.string().min(6, 'invalid.password').max(30, 'invalid.password'),
		passwordConfirm: z
			.string()
			.min(6, 'invalid.passwordConfirm')
			.max(30, 'invalid.passwordConfirm'),
		captcha: z
			.string({ message: 'invalid.captcha' })
			.min(5, 'invalid.captcha')
			.max(5, 'invalid.captcha'),
	})
	.refine(data => data.password === data.passwordConfirm, {
		path: ['passwordConfirm'],
		message: 'notMatch.passwordConfirm',
	});

export const ResetPasswordValidation = z
	.object({
		token: z.string().min(20, 'invalid.token').max(30, 'invalid.token'),
		password: z.string().min(6, 'invalid.password').max(30, 'invalid.password'),
		passwordConfirm: z
			.string()
			.min(6, 'invalid.passwordConfirm')
			.max(30, 'invalid.passwordConfirm'),
	})
	.refine(data => data.password === data.passwordConfirm, {
		path: ['passwordConfirm'],
		message: 'notMatch.passwordConfirm',
	});

export const ForgotPasswordValidation = z.object({
	email: z.email({ message: 'invalid.email' }).max(50, 'invalid.email'),
});

export type LoginType = z.infer<typeof LoginValidation>;
