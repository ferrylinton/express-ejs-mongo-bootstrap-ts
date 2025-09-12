import { Dropdown, Offcanvas, Toast } from 'bootstrap';
import { ThemeToggle } from './theme-toggle';
import { Todo } from './todo';
import { confirm } from './confirm';

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

const initReloadCaptcha = () => {
	const reloadCaptchaButtonEl = document.getElementById('reloadCaptchaButton');
	const captchaImageEl = document.getElementById('captchaImage') as HTMLImageElement;

	if (reloadCaptchaButtonEl && captchaImageEl) {
		reloadCaptchaButtonEl.addEventListener('click', e => {
			e.preventDefault();
			console.log('reloadCaptcha...');

			const current = new Date();
			captchaImageEl.src = captchaImageEl.src.replace(/\?.*/, '') + '?t=' + current.getTime();
		});
	}
}

const initLogout = () => {
	const logoutButton = document.getElementById('logout-button');
	const logoutForm = document.getElementById('logout-form') as HTMLFormElement;

	if (logoutButton && logoutForm !== null) {
		logoutButton.addEventListener('click', async (event: Event) => {
			try {
				const { currentTarget } = event;

				if (currentTarget) {
					const answer = await confirm();

					if (answer) {
						logoutForm.submit();
					}
				}
			} catch (error) {
				console.error(error);
			}
		});
	}
}

window.addEventListener('load', () => {
	// Your TypeScript code to execute after all page resources are loaded
	console.log('Page and all resources loaded!');

	initThemeToggle();
	initMenuToggle();
	initToat();
	initDropdown();
	initSidebar();
	initReloadCaptcha();
	initLogout();

	Todo.init();
});