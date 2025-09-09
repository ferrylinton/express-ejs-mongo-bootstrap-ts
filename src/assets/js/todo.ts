import apiClient from './api-client';
import { format } from 'date-fns';
import { confirm } from './confirm';

export class Todo {
	checkboxes: NodeListOf<Element>;

	todoTaskDates: NodeListOf<Element>;

	deleteButton: Element | null;

	constructor() {
		this.todoTaskDates = document.querySelectorAll('[data-convertToDate]');
		for (let i = 0; i < this.todoTaskDates.length; i++) {
			const str = this.todoTaskDates[i].textContent;
			if (str && str.trim().length > 0) {
				this.todoTaskDates[i].textContent = format(new Date(str), 'dd-LL-yyyy');
			} else {
				this.todoTaskDates[i].textContent = '-';
			}
		}

		this.checkboxes = document.querySelectorAll('table [type=checkbox]');

		for (let i = 0; i < this.checkboxes.length; i++) {
			this.checkboxes[i].addEventListener('click', async event => {
				try {
					event.preventDefault();
					const target = event.target as HTMLInputElement;
					const answer = await confirm();

					if (answer) {
						await apiClient.put(`/api/todoes/${target.id}`);
						window.location.replace('/');
					}
				} catch (error) {
					console.log(error);
				}
			});
		}

		// add delete button event
		this.deleteButton = document.querySelector('[data-delete]');

		if (this.deleteButton) {
			this.deleteButton.addEventListener('click', async (event: Event) => {
				try {
					const { currentTarget } = event;

					if (currentTarget) {
						const id = (currentTarget as HTMLButtonElement).getAttribute('data-delete');
						const answer = await confirm();

						if (answer) {
							await apiClient.delete(`/api/todoes/${id}`);
							window.location.replace('/');
						}
					}
				} catch (error) {
					console.error(error);
				}
			});
		}
	}

	static init() {
		new this();
	}
}
