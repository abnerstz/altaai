import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
      details = typeof exceptionResponse === 'object' ? (exceptionResponse as any) : null;
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = this.handlePrismaError(exception);
      message = this.getPrismaErrorMessage(exception);
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    }

    const errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    if (process.env.NODE_ENV === 'development' && details) {
      errorResponse.details = details;
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception)
    );

    response.status(status).json(errorResponse);
  }

  private handlePrismaError(error: PrismaClientKnownRequestError): number {
    switch (error.code) {
      case 'P2002':
        return HttpStatus.CONFLICT;
      case 'P2025':
        return HttpStatus.NOT_FOUND;
      case 'P2003':
        return HttpStatus.BAD_REQUEST;
      case 'P2014':
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private getPrismaErrorMessage(error: PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2002':
        return 'Registro duplicado. Este valor já existe no sistema.';
      case 'P2025':
        return 'Registro não encontrado.';
      case 'P2003':
        return 'Falha na validação de relacionamento.';
      case 'P2014':
        return 'Violação de constraint de relacionamento.';
      default:
        return 'Erro no banco de dados.';
    }
  }
}
