export type Message = {
	id: string;
	email: string;
	message: string;
	viewed?: boolean;
	createdAt?: Date;
	updatedBy?: string;
	updatedAt?: Date;
};
