export type ValidationError = {
	[key: string]: string;
};

export type ActionForm = {
	errorMessage?: string;
	validationError?: ValidationError;
};

export type ResponseMessage = {
	message?: string;
	errorMessage?: string;
};

export type Pageable<T> = {
	data: Array<T>;
	pagination: Pagination;
	sort?: string;
};

export type Pagination = {
	total: number;
	totalPage: number;
	page: number;
	pageSize: number;
	firstQueryString?: string;
	previousQueryString?: string;
	nextQueryString?: string;
	lastQueryString?: string;
	firstRowNumber?: number;
};

export type FindResult<T> = {
	list: Array<T>;
	total: number;
};

export type RequestParams = {
	keyword?: string;
	page?: number;
	sort?: string;
};

export type PaginationProps = {
	pagination: Pagination;
	goToPage: (page: number) => void;
};

export type KeyValue = {
	[key: string]: string;
};

export type ErrorData = {
	message?: string;
	arg?: string;
};
