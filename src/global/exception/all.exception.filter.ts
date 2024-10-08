import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Response } from '../payload/responses/Response';
import { ValidationException } from './validation.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    console.log(exception);
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorMessage =
      exception instanceof HttpException
        ? exception?.message
        : 'Unexpected Error!';
    if (exception instanceof ValidationException) {
      const details =
        exception instanceof ValidationException
          ? exception.getResponse()
          : null;
      const responseBody = {
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
        message: exception.message,
      };
      httpAdapter.reply(
        ctx.getResponse(),
        Response.error(httpStatus, responseBody, details),
        httpStatus,
      );
    } else {
      const responseBody = {
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
        message: errorMessage,
      };
      httpAdapter.reply(
        ctx.getResponse(),
        Response.error(httpStatus, responseBody),
        httpStatus,
      );
    }
  }
}
