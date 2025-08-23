import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Authentication guard
 * Validates if the request has a valid authentication token
 */
@Injectable()
export class AuthGuard implements CanActivate {
  /**
   * Determines if the current request is authorized
   * @param context The execution context
   * @returns Boolean indicating if the request can proceed
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // This is a placeholder for actual JWT validation logic
    // In a real application, you would validate the JWT token here
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization token provided');
    }

    // For now, we'll just return true
    // In a real app, you would verify the token and extract user info
    return true;
  }
}
