class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super();
    this.message = [{ msg: message }];
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
