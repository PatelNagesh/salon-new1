import { IRepository } from '../../core/interfaces/IRepository';

/**
 * Profile entity interface
 */
export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  preferences?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create profile DTO
 */
export interface CreateProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  preferences?: Record<string, any>;
}

/**
 * Update profile DTO
 */
export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  preferences?: Record<string, any>;
}

/**
 * Profile repository interface
 */
export interface IProfileRepository extends IRepository<Profile, CreateProfileDto, UpdateProfileDto> {
  findByUserId(userId: string): Promise<Profile | null>;
  existsByUserId(userId: string): Promise<boolean>;
}
