export class ThemeToggle {
	// Config
	private _scheme: string = 'auto';
	private rootAttribute: string = 'data-bs-theme';
	private localStorageKey: string = 'bootstrapPreferredColorScheme';
	private checkbox?: HTMLInputElement;

	// Init
	init(): void {
		this.checkbox = document.getElementById('theme-toggle-checkbox') as HTMLInputElement;

		if (!this.checkbox) {
			console.error('Theme toggle not found');
			return;
		}

		// If first visit, use the theme from <html> attribute; otherwise, use stored preference
		this.scheme = this.schemeFromLocalStorage ?? this.schemeFromHTML;

		// Set checkbox state based on the applied theme
		this.checkbox.checked = this.scheme === 'dark';

		// Listen for user changes
		this.checkbox.addEventListener('change', event => {
			event.preventDefault();
			this.scheme = this.checkbox!.checked ? 'dark' : 'light';
			this.schemeToLocalStorage();

			// reload page
			const currentUrl = new URL(window.location.href);
			const newUrl = currentUrl.origin + currentUrl.pathname;
			window.location.href = newUrl;
		});
	}

	// Get color scheme from local storage
	private get schemeFromLocalStorage(): string | null {
		return window.localStorage?.getItem(this.localStorageKey);
	}

	// Get the default theme from the <html> attribute
	private get schemeFromHTML(): string {
		return document.documentElement.getAttribute(this.rootAttribute) ?? 'auto';
	}

	// Preferred color scheme from system
	private get preferredColorScheme(): string {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	// Set scheme
	private set scheme(scheme: string) {
		if (scheme === 'auto') {
			this._scheme = this.preferredColorScheme;
		} else if (scheme === 'dark' || scheme === 'light') {
			this._scheme = scheme;
		}
		this.applyScheme();
	}

	// Get scheme
	private get scheme(): string {
		return this._scheme;
	}

	// Apply scheme
	private applyScheme(): void {
		document.documentElement.setAttribute(this.rootAttribute, this._scheme);
	}

	// Store scheme to local storage
	private schemeToLocalStorage(): void {
		window.localStorage?.setItem(this.localStorageKey, this.scheme);
	}
}
