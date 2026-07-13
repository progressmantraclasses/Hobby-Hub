// Thrown when an upstream AI provider call itself fails (rate limit, outage, bad key) —
// distinct from the model returning a response that fails our own schema validation.
// errorHandler.middleware.ts maps this to a 503 instead of a generic 500.
export class AIProviderError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AIProviderError";
  }
}
