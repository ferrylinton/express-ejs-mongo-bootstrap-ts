import { createCanvas } from 'canvas';

export const generateRandomText = (allowNumber: boolean, length: number, uppercase: boolean) => {
	let characters = 'abcdefghijklmnopqrstuvwxyz';
	if (allowNumber) characters += '0123456789';
	if (uppercase) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	let result = '';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	return result;
};

export const generateCoreCaptcha = (text: string) => {
	const canvas = createCanvas(200, 60);
	const ctx = canvas.getContext('2d');

	// Set background color
	ctx.fillStyle = '#f0f0f0';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Set text properties
	ctx.font = '30px Arial';
	ctx.fillStyle = '#000';

	// Rotate and draw each character individually
	const xStart = 20;
	const yStart = 40;
	for (let i = 0; i < text.length; i++) {
		const char = text.charAt(i);
		ctx.save();
		const x = xStart + i * 30;
		const y = yStart + (Math.random() * 10 - 5);
		ctx.translate(x, y);
		ctx.rotate(Math.random() * 0.4 - 0.2); // Rotate between -0.2 and 0.2 radians
		ctx.fillText(char, 0, 0);
		ctx.restore();
	}

	// Add noise lines
	for (let i = 0; i < 8; i++) {
		ctx.strokeStyle = '#' + ((Math.random() * 0xffffff) << 0).toString(16);
		ctx.beginPath();
		ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
		ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
		ctx.stroke();
	}

	// Add random dots
	for (let i = 0; i < 100; i++) {
		ctx.fillStyle = '#' + ((Math.random() * 0xffffff) << 0).toString(16);
		ctx.beginPath();
		ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
		ctx.fill();
	}

	return canvas;
};
