import { Response } from 'express';

export interface SuccessResponse<T> {
  status: 'success';
  data: T;
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  errors?: unknown;
}

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200): Response => {
  const responsePayload: SuccessResponse<T> = {
    status: 'success',
    data
  };
  return res.status(statusCode).json(responsePayload);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown
): Response => {
  const responsePayload: ErrorResponse = {
    status: 'error',
    message
  };
  if (errors !== undefined) {
    responsePayload.errors = errors;
  }
  return res.status(statusCode).json(responsePayload);
};
