class APIError extends Error {
  status: number;

  constructor(httpStatus: number, message: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.status = httpStatus;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

export default APIError;
