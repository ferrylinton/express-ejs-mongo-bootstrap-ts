import z from 'zod';

export const LoginValidation = z.object({
	username: z.string().min(3, 'invalidUsername').max(20, 'invalidUsername'),
	password: z.string().min(6, 'invalidPassword').max(30, 'invalidPassword'),
	captcha: z
		.string({ message: 'invalidCaptcha' })
		.min(5, 'invalidCaptcha')
		.max(5, 'invalidCaptcha'),
});

export const RegisterValidation = z
	.object({
		username: z.string().min(3, 'invalidUsername').max(20, 'invalidUsername'),
		email: z.email({ message: 'invalidEmail' }).max(50, 'invalidEmail'),
		password: z.string().min(6, 'invalidPassword').max(30, 'invalidPassword'),
		confirmPassword: z
			.string()
			.min(6, 'invalidConfirmPassword')
			.max(30, 'invalidConfirmPassword'),
		captcha: z
			.string({ message: 'invalidCaptcha' })
			.min(5, 'invalidCaptcha')
			.max(5, 'invalidCaptcha'),
	})
	.refine(data => data.password === data.confirmPassword, {
		path: ['confirmPassword'],
		message: 'confirmPasswordNotMatch',
	});

export const ResetPasswordValidation = z
	.object({
		token: z.string().min(20, 'invalidToken').max(30, 'invalidToken'),
		password: z.string().min(6, 'invalidPassword').max(30, 'invalidPassword'),
		confirmPassword: z
			.string()
			.min(6, 'invalidConfirmPassword')
			.max(30, 'invalidConfirmPassword'),
	})
	.refine(data => data.password === data.confirmPassword, {
		path: ['confirmPassword'],
		message: 'confirmPasswordNotMatch',
	});

export const ForgotPasswordValidation = z.object({
	email: z.email({ message: 'invalidEmail' }).max(50, 'invalidEmail'),
});

export type LoginType = z.infer<typeof LoginValidation>;
