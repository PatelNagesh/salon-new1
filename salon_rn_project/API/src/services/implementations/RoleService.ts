import { BaseService } from '../../core/base/BaseService';
import { IRoleService } from '../interfaces/IRoleService';
import { UserRole, hasPermission, getRolePermissions } from '../../constants/role.constants';
import { Logger } from '../../core/utils/logger.util';
import { ValidationException, ForbiddenException } from '../../exceptions';

/**
 * Role service implementation
 */
export class RoleService extends BaseService implements IRoleService {
  private logger = new Logger('RoleService');

  async getUserRole(userId: string): Promise<string> {
    this.logger.info('Getting user role:', { userId });

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      throw new ValidationException('VAL_001', 'User not found');
    }

    return user.user_metadata?.role || UserRole.CUSTOMER;
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    this.logger.info('Checking user permission:', { userId, permission });

    const role = await this.getUserRole(userId);
    return hasPermission(role as UserRole, permission);
  }

  async canAccessResource(userId: string, resourceType: string, action: string, resourceId?: string): Promise<boolean> {
    this.logger.info('Checking resource access:', { userId, resourceType, action, resourceId });

    const role = await this.getUserRole(userId);
    const permission = `${action}_${resourceType}`;

    return hasPermission(role as UserRole, permission);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    this.logger.info('Getting user permissions:', { userId });

    const role = await this.getUserRole(userId);
    return getRolePermissions(role as UserRole);
  }

  async assignRole(userId: string, role: string): Promise<any> {
    this.logger.info('Assigning role to user:', { userId, role });

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role }
    });

    if (error) {
      this.logger.error('Assign role error:', error);
      throw new ValidationException('VAL_001', 'Failed to assign role', error.message);
    }

    return data;
  }

  async removeRole(userId: string, role: string): Promise<any> {
    this.logger.info('Removing role from user:', { userId, role });

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: UserRole.CUSTOMER }
    });

    if (error) {
      this.logger.error('Remove role error:', error);
      throw new ValidationException('VAL_001', 'Failed to remove role', error.message);
    }

    return data;
  }

  async getAllRoles(): Promise<any[]> {
    this.logger.info('Getting all roles');

    return Object.values(UserRole).map(role => ({
      name: role,
      permissions: getRolePermissions(role as UserRole)
    }));
  }

  async getRolePermissions(role: string): Promise<string[]> {
    this.logger.info('Getting role permissions:', { role });

    return getRolePermissions(role as UserRole);
  }

  async updateRolePermissions(role: string, permissions: string[]): Promise<any> {
    this.logger.info('Updating role permissions:', { role, permissions });

    throw new ForbiddenException('FORBIDDEN_001', 'Role permissions cannot be updated directly');
  }
}
