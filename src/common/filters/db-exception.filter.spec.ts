import {
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { vi } from 'vitest';

import { DbExceptionFilter } from './db-exception.filter.js';

describe('DbExceptionFilter', () => {
  let filter: DbExceptionFilter;

  let response: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };

  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new DbExceptionFilter();

    response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    host = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: vi.fn().mockReturnValue(response),
      }),
    } as unknown as ArgumentsHost;

    vi.clearAllMocks();
  });

  it('should preserve an HttpException status', () => {
    filter.catch(new NotFoundException('Not found'), host);

    expect(response.status).toHaveBeenCalledWith(404);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
      }),
    );
  });

  it('should map foreign key violation to 400', () => {
    const error = {
      kind: 'sql_query',
      sqlState: '23503',
      message: 'foreign key violation',
      stack: 'stack',
    };

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(400);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Invalid reference.',
      }),
    );
  });

  it('should map unique violation to 409', () => {
    const error = {
      kind: 'sql_query',
      sqlState: '23505',
      message: 'duplicate key',
      stack: 'stack',
    };

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(409);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        message: 'A value that must be unique already exists.',
      }),
    );
  });

  it('should map not-null violation to 400', () => {
    const error = {
      kind: 'sql_query',
      sqlState: '23502',
      message: 'null value',
      stack: 'stack',
    };

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(400);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'A required field is missing.',
      }),
    );
  });

  it('should map check violation to 400', () => {
    const error = {
      kind: 'sql_query',
      sqlState: '23514',
      message: 'check violation',
      stack: 'stack',
    };

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(400);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'The provided value violates a data constraint.',
      }),
    );
  });

  it('should map invalid text representation to 400', () => {
    const error = {
      kind: 'sql_query',
      sqlState: '22P02',
      message: 'invalid input syntax',
      stack: 'stack',
    };

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(400);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Invalid input syntax for one of the provided values.',
      }),
    );
  });

  it('should map an unknown SQL state to 500', () => {
    const error = {
      kind: 'sql_query',
      sqlState: '99999',
      message: 'unknown database error',
      stack: 'stack',
    };

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(500);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Unexpected database error.',
      }),
    );
  });

  it('should map an unexpected error to 500', () => {
    filter.catch(new Error('Something went wrong'), host);

    expect(response.status).toHaveBeenCalledWith(500);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
  });
});