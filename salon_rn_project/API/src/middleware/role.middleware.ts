import { Request, Response, NextFunction } from 'express';
import { ForbiddenException } from '../../exceptions';

/**
 * Role-based access control middleware
 * Checks if user has required role
 */
export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new ForbiddenException('User not authenticated');
      }

      const userRole = user.role;

      if (!allowedRoles.includes(userRole)) {
        throw new ForbiddenException(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Super admin only middleware
 */
export const superAdminOnly = roleMiddleware('super_admin');

/**
 * Salon owner only middleware
 */
export const salonOwnerOnly = roleMiddleware('salon_owner', 'super_admin');

/**
 * Staff only middleware
 */
export const staffOnly = roleMiddleware('staff', 'salon_owner', 'super_admin');

/**
 * Customer only middleware
 */
export const customerOnly = roleMiddleware('customer', 'staff', 'salon_owner', 'super_admin');

/**
 * Salon access middleware
 * Checks if user has access to specific salon
 */
export const salonAccessMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const user = (req as any).user;
    const salonId = req.params.salonId || req.body.salonId;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super admins have access to all salons
    if (user.role === 'super_admin') {
      return next();
    }

    // Salon owners can only access their own salons
    if (user.role === 'salon_owner' && user.salonId !== salonId) {
      throw new ForbiddenException('Access denied to this salon');
    }

    // Staff can only access their assigned salon
    if (user.role === 'staff' && user.salonId !== salonId) {
      throw new ForbiddenException('Access denied to this salon');
    }

    next();
  } catch (error) {
    next(error);
  }
};
