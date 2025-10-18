import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";
import { z, type ZodSchema } from "zod";
import type {
  OpenRouterMessage,
  OpenRouterPayload,
  OpenRouterServiceOptions,
  ResponseFormat,
  SendMessageOptions,
} from "./openrouter-service.types";
import { ApiError, AuthError, FormatError, NetworkError, RateLimitError } from "./openrouter-service.types";

/**
 * Service for interacting with OpenRouter API
 * Provides abstraction layer for LLM chat completions
 *
 * @example
 * ```ts
 * const openRouter = new OpenRouterService({
 *   apiKey: import.meta.env.OPENROUTER_API_KEY,
 *   defaultModel: 'openai/gpt-4o-mini'
 * });
 *
 * const response = await openRouter.sendMessage([
 *   { role: 'system', content: 'You are a helpful assistant.' },
 *   { role: 'user', content: 'Hello!' }
 * ]);
 * ```
 */
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private defaultModel: string;
  private defaultParams: Record<string, any>;
  private readonly axiosInstance: AxiosInstance;

  constructor(options: OpenRouterServiceOptions) {
    if (!options.apiKey) {
      throw new AuthError("API key is required");
    }

    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://openrouter.ai/api";
    this.defaultModel = options.defaultModel || "openai/gpt-4o-mini";
    this.defaultParams = options.defaultParams || {};

    // Initialize axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 60000, // 60 seconds timeout
    });
  }

  /**
   * Set default model for requests
   */
  public setDefaultModel(model: string): void {
    this.defaultModel = model;
  }

  /**
   * Set default parameters for requests
   */
  public setDefaultParams(params: Record<string, any>): void {
    this.defaultParams = params;
  }

  /**
   * Send message to LLM and get response
   */
  public async sendMessage(messages: OpenRouterMessage[], options?: SendMessageOptions): Promise<any> {
    if (!messages || messages.length === 0) {
      throw new FormatError("Messages array cannot be empty");
    }

    const model = options?.model || this.defaultModel;
    const params = { ...this.defaultParams, ...options?.params };
    const responseFormat = options?.responseFormat;

    const payload = this._buildPayload(messages, model, params, responseFormat);

    try {
      const response = await this._request(payload);

      // Validate response if schema provided
      if (options?.responseFormat?.json_schema?.schema) {
        const zodSchema = this._convertJsonSchemaToZod(options.responseFormat.json_schema.schema);
        return this._validateResponse(response, zodSchema);
      }

      return response;
    } catch (error) {
      throw this._handleErrors(error);
    }
  }

  /**
   * Build request payload
   */
  private _buildPayload(
    messages: OpenRouterMessage[],
    model: string,
    params: Record<string, any>,
    responseFormat?: ResponseFormat
  ): OpenRouterPayload {
    const payload: OpenRouterPayload = {
      model,
      messages,
      ...params,
    };

    if (responseFormat) {
      payload.response_format = responseFormat;
    }

    return payload;
  }

  /**
   * Execute API request
   */
  private async _request(payload: OpenRouterPayload): Promise<any> {
    try {
      const response = await this.axiosInstance.post("/v1/chat/completions", payload);

      if (!response.data) {
        throw new FormatError("Empty response from API");
      }

      return this._extractContent(response.data);
    } catch (error) {
      return this._handleAxiosError(error);
    }
  }

  /**
   * Extract content from API response
   */
  private _extractContent(data: any): any {
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new FormatError("No content in API response");
    }

    // If content is JSON string, parse it
    try {
      return JSON.parse(content);
    } catch {
      // If not JSON, return as is
      return content;
    }
  }

  /**
   * Handle Axios-specific errors
   */
  private _handleAxiosError(error: unknown): never {
    if (!axios.isAxiosError(error)) {
      throw error;
    }

    const axiosError = error as AxiosError;

    // Check for specific HTTP status codes
    if (axiosError.response) {
      this._handleHttpError(axiosError);
    }

    // Check for network errors
    this._handleNetworkError(axiosError);
  }

  /**
   * Handle HTTP errors based on status code
   */
  private _handleHttpError(axiosError: AxiosError): never {
    const status = axiosError.response?.status;

    if (status === 429) {
      const retryAfter = axiosError.response?.headers["retry-after"];
      throw new RateLimitError("Rate limit exceeded", retryAfter ? Number.parseInt(retryAfter, 10) : undefined);
    }

    if (status === 401 || status === 403) {
      throw new AuthError("Invalid API key or unauthorized access");
    }

    throw new ApiError(`API error: ${axiosError.message}`, status || 500, axiosError.response?.data);
  }

  /**
   * Handle network-related errors
   */
  private _handleNetworkError(axiosError: AxiosError): never {
    if (axiosError.code === "ECONNABORTED" || axiosError.code === "ETIMEDOUT") {
      throw new NetworkError("Request timeout", axiosError);
    }

    throw new NetworkError(`Network error: ${axiosError.message}`, axiosError);
  }

  /**
   * Convert JSON Schema to Zod schema (basic implementation)
   * For more complex schemas, consider using a dedicated library
   */
  private _convertJsonSchemaToZod(jsonSchema: any): ZodSchema {
    // Basic conversion - can be extended for more complex schemas
    if (jsonSchema.type === "object") {
      const shape: Record<string, ZodSchema> = {};

      if (jsonSchema.properties) {
        for (const [key, value] of Object.entries(jsonSchema.properties)) {
          shape[key] = this._convertJsonSchemaToZod(value);
        }
      }

      return z.object(shape);
    }

    if (jsonSchema.type === "string") {
      return z.string();
    }

    if (jsonSchema.type === "number") {
      return z.number();
    }

    if (jsonSchema.type === "boolean") {
      return z.boolean();
    }

    if (jsonSchema.type === "array") {
      return z.array(this._convertJsonSchemaToZod(jsonSchema.items));
    }

    // Fallback to any
    return z.any();
  }

  /**
   * Validate response against Zod schema
   */
  private _validateResponse(response: any, schema: ZodSchema): any {
    const result = schema.safeParse(response);

    if (!result.success) {
      throw new FormatError("Response validation failed", result.error.errors);
    }

    return result.data;
  }

  /**
   * Handle and transform errors
   */
  private _handleErrors(error: unknown): Error {
    // If already our custom error, return as is
    if (
      error instanceof AuthError ||
      error instanceof NetworkError ||
      error instanceof ApiError ||
      error instanceof FormatError ||
      error instanceof RateLimitError
    ) {
      return error;
    }

    // Transform unknown errors
    if (error instanceof Error) {
      return new NetworkError(`Unexpected error: ${error.message}`, error);
    }

    return new NetworkError("Unknown error occurred");
  }
}
