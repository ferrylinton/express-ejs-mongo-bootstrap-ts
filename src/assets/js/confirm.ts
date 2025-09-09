import { Modal } from 'bootstrap';

export const confirm = (): Promise<boolean> => {
	const modalElement = document.getElementById('confirm-modal') as HTMLDialogElement;
	const modal = new Modal(modalElement);
	const okButton = document.getElementById('confirm-ok');
	const cancelButton = document.getElementById('confirm-cancel');

	return new Promise(resolve => {
		modal.show();

		const handleOk = () => {
			modal.hide();
			okButton?.blur();
			okButton?.removeEventListener('click', handleOk);
			cancelButton?.removeEventListener('click', handleCancel);
			resolve(true);
		};

		const handleCancel = () => {
			modal.hide();
			cancelButton?.blur();
			okButton?.removeEventListener('click', handleOk);
			cancelButton?.removeEventListener('click', handleCancel);
			resolve(false);
		};

		okButton?.addEventListener('click', handleOk);
		cancelButton?.addEventListener('click', handleCancel);
	});
};
