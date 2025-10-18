// Custom error classes for better error handling
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly responseBody?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class FormatError extends Error {
  constructor(
    message: string,
    public readonly validationErrors?: any
  ) {
    super(message);
    this.name = "FormatError";
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfter?: number
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

// Types
export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: object;
  };
}

export interface SendMessageOptions {
  model?: string;
  params?: Record<string, any>;
  responseFormat?: ResponseFormat;
}

export interface OpenRouterServiceOptions {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  defaultParams?: Record<string, any>;
}

export interface OpenRouterPayload {
  model: string;
  messages: OpenRouterMessage[];
  response_format?: ResponseFormat;
  [key: string]: any;
}
