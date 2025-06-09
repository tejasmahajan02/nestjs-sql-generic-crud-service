import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const err: any = exception;
    console.log(err);

    let { detail = '', table = 'table', column = 'field' } = err || {};

    let exceptionToThrow: HttpException;
    switch (err.code) {
      case '23505': {
        // Unique violation
        const fieldAlreadyExistMatch = detail?.match(
          /Key \((.+?)\)=\(.+?\) already exists\./,
        );

        const columnName = fieldAlreadyExistMatch
          ? fieldAlreadyExistMatch[1]
          : table;

        exceptionToThrow = new ConflictException(
          `${columnName} already exists.`,
        );
        break;
      }
      case '23503': {
        // Foreign key violation
        const foreignKeyNotFoundMatch = detail.match(
          /Key \((.*?)\)=\((.*?)\) is not present in table "(.*?)"\./,
        );

        const foreignKey = foreignKeyNotFoundMatch?.[1];
        const foreignKeyTable = foreignKeyNotFoundMatch?.[3];

        // Record not found (e.g., when updating/deleting a non-existent record)
        exceptionToThrow = new NotFoundException(
          `${foreignKey || foreignKeyTable} not found.`,
        );
        break;
      }
      case '23502': {
        // Not null violation
        exceptionToThrow = new BadRequestException(
          `${column} should not empty.`,
        );
        break;
      }
      default:
        exceptionToThrow = new InternalServerErrorException(
          'Unexpected database error.',
        );
        break;
    }

    response
      .status(exceptionToThrow.getStatus())
      .json(exceptionToThrow.getResponse());
  }
}
