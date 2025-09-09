export const generateRandomString = (length: number): string => {
	return Math.random().toString(20).slice(2, length);
};
