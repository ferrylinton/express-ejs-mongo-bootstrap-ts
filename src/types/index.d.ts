export {};

declare global {
	interface Window {
		toast: () => void;
		reloadCaptcha: (el: HTMLElement) => void;
	}
}
