export default class AuthError extends Error {

    statusCode: number;

    constructor(message: string, statusCode: number = 401) {
        super(message); 
        this.name = 'AuthError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AuthError.prototype);
    }
}