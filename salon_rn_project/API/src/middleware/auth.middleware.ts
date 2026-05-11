import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '../../exceptions';

/**
 * Authentication middleware
 * Validates JWT tokens and attaches user to request
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);

    // TODO: Validate token with Supabase
    // const { data: { user }, error } = await supabase.auth.getUser(token);
    // if (error || !user) {
    //   throw new UnauthorizedException('Invalid token');
    // }

    // req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is present, but doesn't require it
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // TODO: Validate token with Supabase
      // const { data: { user }, error } = await supabase.auth.getUser(token);
      // if (!error && user) {
      //   req.user = user;
      // }
    }

    next();
  } catch (error) {
    next(error);
  }
};
