import { endOfDay, format, isValid, parse } from 'date-fns';

export const DATE_FORMAT = 'dd/MM/yyyy';

export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm:ss SSS';

export const parseDate = (str: string | null) => {
	if (str) {
		const result = parse(str.trim(), DATE_FORMAT, new Date());
		if (isValid(result)) {
			return result;
		}
	}

	return null;
};

export const getEndDate = (str: string | null) => {
	const date = parseDate(str);
	if (date) {
		return endOfDay(date);
	}

	return null;
};

export const formatToDatetime = (date: Date | null | undefined) => {
	try {
		if (date) {
			return format(date, DATETIME_FORMAT);
		} else {
			return '-';
		}
	} catch (error) {
		return '-';
	}
};

export const formatToDate = (date: Date | null | undefined) => {
	try {
		if (date) {
			return format(date, DATE_FORMAT);
		} else {
			return '-';
		}
	} catch (error) {
		return '-';
	}
};

export const formatDate = (date: Date | null | undefined, dateFormat?: string) => {
	try {
		if (date) {
			return format(date, dateFormat || 'yyyy-MM-dd');
		} else {
			return '-';
		}
	} catch (error) {
		return '-';
	}
};
