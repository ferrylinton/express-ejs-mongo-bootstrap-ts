import { parseDate } from '@/utils/date-util';
import { z } from 'zod';

export const DateRangeSchema = z.object({
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	dateRange: z.string().optional(),
});

export const AuditTrailQuerySchema = z.object({
	dateRange: z.preprocess(dateRange => {
		if (typeof dateRange === 'string') {
			const arr = dateRange.split('-');

			if (arr.length === 2) {
				const startDate = parseDate(arr[0]);
				const endDate = parseDate(arr[1]);

				if (startDate !== null && endDate !== null) {
					return {
						startDate,
						endDate,
						dateRange,
					};
				}
			}
		}

		return undefined;
	}, z.optional(DateRangeSchema)),
	page: z.preprocess(
		arg => {
			if (typeof arg === 'string') {
				const number = Number(arg.trim());

				if (!isNaN(number)) {
					return number;
				}
			}

			return undefined;
		},
		z.number({ message: 'invalid.page' }).optional()
	),

	keyword: z.preprocess(
		arg => {
			if (typeof arg === 'string') {
				const str = arg.trim();

				if (str.length > 2) {
					return str;
				}
			}

			return undefined;
		},
		z.string({ message: 'invalid.keyword' }).optional()
	),
});

export type AuditTrailQuery = z.TypeOf<typeof AuditTrailQuerySchema>;
