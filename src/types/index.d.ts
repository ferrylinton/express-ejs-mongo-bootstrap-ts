export {};

declare global {
	interface Window {
		initDateRangePicker: (startDate: string | undefined, endDate: string | undefined) => void;
	}
}
