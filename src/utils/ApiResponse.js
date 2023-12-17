class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };

//http status code
// Informational Response (100 - 199)
// Successful Response (200 - 299)
// Redirection messages (300 - 399)
// Client error response (400 -499)
// Server error response (500 - 599)
