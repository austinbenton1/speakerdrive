export class LeadVisitError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'LeadVisitError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'User not authenticated') {
    super(message);
    this.name = 'AuthenticationError';
  }
}