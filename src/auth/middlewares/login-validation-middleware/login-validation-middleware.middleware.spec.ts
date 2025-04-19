import { LoginValidationMiddlewareMiddleware } from './login-validation-middleware.middleware';

describe('LoginValidationMiddlewareMiddleware', () => {
  it('should be defined', () => {
    expect(new LoginValidationMiddlewareMiddleware()).toBeDefined();
  });
});
