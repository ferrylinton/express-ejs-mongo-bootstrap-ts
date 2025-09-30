import AirDatepicker from 'air-datepicker';
import localeEn from 'air-datepicker/locale/en';
import localeId from 'air-datepicker/locale/id';
import { Dropdown, Offcanvas, Toast } from 'bootstrap';
import { format, subMonths } from 'date-fns';
import { confirm } from './confirm';
import { ThemeToggle } from './theme-toggle';
import { Todo } from './todo';

const initMenuToggle = () => {
	const menuToggle = document.getElementById('menu-toggle');

	if (menuToggle) {
		menuToggle.addEventListener('click', e => {
			e.preventDefault();

			if (e.currentTarget instanceof HTMLElement) {
				e.currentTarget.classList.toggle('is-active');
				document.body.classList.toggle('sidebar-is-active');
			}
		});
	}
};

const initToat = () => {
	const messageToastEl = document.getElementById('messageToast');

	if (messageToastEl) {
		const messageToast = Toast.getOrCreateInstance(messageToastEl);
		messageToast.show();
	}
};

const initDropdown = () => {
	Array.from(document.querySelectorAll('.dropdown')).forEach(toastNode => {
		new Dropdown(toastNode);
	});
};

const initSidebar = () => {
	const offcanvasResponsiveEl = document.getElementById('offcanvasResponsive');

	if (offcanvasResponsiveEl) {
		new Offcanvas(offcanvasResponsiveEl);
	}
};

const initThemeToggle = () => {
	const themeToggle = new ThemeToggle();
	themeToggle.init();
};

const initLogout = () => {
	const logoutButton = document.getElementById('logout-button');
	const logoutForm = document.getElementById('logout-form') as HTMLFormElement;

	if (logoutButton && logoutForm !== null) {
		logoutButton.addEventListener('click', async (event: Event) => {
			try {
				const target = event.currentTarget as HTMLElement;
				const message = target.getAttribute('data-message');
				const answer = await confirm(message);

				if (answer) {
					logoutForm.submit();
				}
			} catch (error) {
				console.error(error);
			}
		});
	}
};

const initSidebarMenu = () => {
	const currentUrl = window.location.origin + window.location.pathname;
	const menus = document.querySelectorAll('.sidebar-menu a');
	let hasActive = false;

	for (let i = 0; i < menus.length; i++) {
		const menu = menus[i] as HTMLAnchorElement;

		if (menu.href === currentUrl) {
			menu.classList.add('active');
			hasActive = true;
			break;
		}
	}

	if (!hasActive) {
		const backLink = document.getElementById('back-link');

		if (backLink) {
			for (let i = 0; i < menus.length; i++) {
				const menu = menus[i] as HTMLAnchorElement;

				if (menu.href === (backLink as HTMLAnchorElement).href) {
					menu.classList.add('active');
					break;
				}
			}
		}
	}
};

const initFormatDatetime = () => {
	const dateElements = document.querySelectorAll('[data-convertToDatetime]');

	for (let i = 0; i < dateElements.length; i++) {
		const str = dateElements[i].textContent;
		if (str && str.trim().length > 0) {
			dateElements[i].textContent = format(new Date(str), 'dd/LL/yy HH:mm:ss');
		} else {
			dateElements[i].textContent = '-';
		}
	}
};

window.initDateRangePicker = (startDate: string | undefined, endDate: string | undefined) => {
	const datePickerEls = document.querySelectorAll('input[role="dateRange"]');
	const maxDate = new Date();
	const minDate = subMonths(maxDate, 2);
	const locale = document.documentElement.lang === 'id' ? localeId : localeEn;

	for (let i = 0; i < datePickerEls.length; i++) {
		const el = datePickerEls[i] as HTMLElement;

		new AirDatepicker(el, {
			minDate,
			maxDate,
			locale,
			range: true,
			multipleDatesSeparator: '-',
			autoClose: true,
			buttons: ['today', 'clear'],
			selectedDates: startDate && endDate ? [startDate, endDate] : [],
		});
	}
};

window.fetchCaptcha = async () => {
	const captchaSpinnerEl = document.getElementById('captchaSpinner');
	if (captchaSpinnerEl) {
		captchaSpinnerEl.style.display = 'flex';
	}

	try {
		const captchaImageEl = document.getElementById('captchaImage') as HTMLImageElement;

		if (captchaImageEl) {
			const current = new Date();
			const response = await fetch(`/captcha?t=${current.getTime()}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const blob = await response.blob();
			const objectURL = URL.createObjectURL(blob);
			captchaImageEl.src = objectURL;
		}
	} catch (error) {
		console.error('Error fetching or setting image:', error);
	} finally {
		if (captchaSpinnerEl) {
			setTimeout(function () {
				captchaSpinnerEl.style.display = 'none';
			}, 250);
		}
	}
};

window.addEventListener('load', () => {
	console.log('Page and all resources loaded!');

	initThemeToggle();
	initMenuToggle();
	initToat();
	initDropdown();
	initSidebar();
	initLogout();
	initSidebarMenu();
	initFormatDatetime();
	window.fetchCaptcha();

	Todo.init();
});
