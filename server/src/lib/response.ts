import type { User } from "@prisma/client";

export class SuccessResponse<T> {
  status: "success";
  data: T;
  message?: string;

  constructor(data: T, message?: string) {
    this.status = "success";
    this.data = data;
    this.message = message;
  }
}

export class ErrorResponse {
  status: "error";
  code: number;
  message: string;

  constructor(code: number, message: string) {
    this.status = "error";
    this.code = code;
    this.message = message;
  }
}

export class HandleResponse {
  success<T>(data: T, message?: string): SuccessResponse<T> {
    return new SuccessResponse<T>(data, message);
  }

  error(code: number, message: string): ErrorResponse {
    return new ErrorResponse(code, message);
  }
}

export type AuthResponse = {
  user: Omit<User, "password">;
  token: string;
};

export type ServiceResponse<T> = SuccessResponse<T> | ErrorResponse;

export type AuthRequest = {
  email: string;
  password: string;
};

export const res = new HandleResponse();
