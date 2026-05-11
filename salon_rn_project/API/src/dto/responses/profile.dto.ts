/**
 * Profile response DTOs
 */

/**
 * Profile response DTO
 */
export interface ProfileResponseDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  preferences?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Profile summary response DTO
 */
export interface ProfileSummaryResponseDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

/**
 * Profile detail response DTO
 */
export interface ProfileDetailResponseDto extends ProfileResponseDto {
  fullName: string;
  role?: string;
  salonCount?: number;
  lastLoginDate?: string;
}
