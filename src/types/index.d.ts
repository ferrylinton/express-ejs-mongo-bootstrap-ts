import { Offcanvas } from 'bootstrap';

export {};

declare global {
	interface Window {
		initDateRangePicker: (startDate: string | undefined, endDate: string | undefined) => void;
		fetchCaptcha: () => void;
		sidebarOffcanvas: Offcanvas;
	}
}
