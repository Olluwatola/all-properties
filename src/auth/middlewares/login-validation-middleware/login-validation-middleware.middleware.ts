import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Response } from 'express';
import { LoginPayloadDto } from './../../dtos/LoginPayloadDto';

@Injectable()
export class LoginValidationMiddlewareMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const loginPayload = plainToInstance(LoginPayloadDto, req.body);
    const errors = await validate(loginPayload);

    if (errors.length > 0) {
      throw new ForbiddenException({
        message: 'Validation failed',
        errors: errors
          .map((err) => (err.constraints ? Object.values(err.constraints) : [])) // Handle undefined case
          .flat(),
      });
    }

    next(); // Pass control to the next middleware/guard/handler
  }
}
