import z, { object, string } from 'zod';

export const CreateMessageSchema = object({
	email: z.email({ message: 'invalidEmail' }).max(50, 'invalidEmail'),
	message: string({ message: 'invalidContactMeMessage' })
		.min(20, 'invalidContactMeMessage')
		.max(1000, 'invalidContactMeMessage'),
	captcha: string({ message: 'invalidCaptcha' })
		.min(5, 'invalidCaptcha')
		.max(5, 'invalidCaptcha'),
});

export type CreateMessageType = z.infer<typeof CreateMessageSchema>;
