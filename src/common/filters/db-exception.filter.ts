import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface SqlQueryError extends Error {
  kind: 'sql_query';
  sqlState: string;
  constraint?: string;
  table?: string;
  column?: string;
  detail?: string;
}

function isSqlQueryError(error: unknown): error is SqlQueryError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as any).kind === 'sql_query'
  );
}

const SQLSTATE_MAP: Record<
  string,
  { status: number; message: (e: SqlQueryError) => string }
> = {
  '23503': {
    // foreign_key_violation
    status: HttpStatus.BAD_REQUEST,
    message: () => 'Invalid reference.',
  },
  '23505': {
    // unique_violation
    status: HttpStatus.CONFLICT,
    message: () => 'A value that must be unique already exists.',
  },
  '23502': {
    // not_null_violation
    status: HttpStatus.BAD_REQUEST,
    message: () => 'A required field is missing.',
  },
  '23514': {
    // check_violation
    status: HttpStatus.BAD_REQUEST,
    message: () => 'The provided value violates a data constraint.',
  },
  '22P02': {
    // invalid_text_representation
    status: HttpStatus.BAD_REQUEST,
    message: () => 'Invalid input syntax for one of the provided values.',
  },
};

@Catch()
export class DbExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DbExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Things you (or Nest) throw on purpose keep their own status/shape
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return response.status(status).json({
        statusCode: status,
        message: exception.getResponse(),
        timestamp: new Date().toISOString(),
      });
    }

    // Raw driver-level SQL errors (what you're hitting right now)
    if (isSqlQueryError(exception)) {
      const mapping = SQLSTATE_MAP[exception.sqlState];
      const status = mapping?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        mapping?.message(exception) ?? 'Unexpected database error.';

      this.logger.error(
        `[${exception.sqlState}] Database query error`,
        exception.stack,
      );

      return response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
      });
    }

    // Anything else — unexpected, log fully, don't leak internals
    this.logger.error(exception instanceof Error ? exception.stack : exception);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}
