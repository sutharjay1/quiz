import type { MessageResponse } from "./message-response.ts";

export interface ErrorResponse extends MessageResponse {
  stack?: string;
  message: string;
}

export type auth = {
  email: string;
  password: string;
};
