export const ErrorCode = {
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  PASSWORD_CHANGE_REQUIRED: 'PASSWORD_CHANGE_REQUIRED',
};

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }

  static badRequest(message = 'Bad request', code) {
    return new ApiError(400, message, code);
  }

  static unauthorized(message = 'Not authenticated', code = ErrorCode.UNAUTHENTICATED) {
    return new ApiError(401, message, code);
  }

  static forbidden(message = 'Forbidden', code) {
    return new ApiError(403, message, code);
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }
}
