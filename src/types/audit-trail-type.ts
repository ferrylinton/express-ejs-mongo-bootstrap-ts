export type AuditTrail = {
	id: string;
	requestId: string;
	createdAt: Date;
	url: string;
	method: string;
	params: any;
	query: any;
	payload?: any;
	error?: any;
};
