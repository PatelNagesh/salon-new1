import { BaseRepository } from '../../core/base/BaseRepository';
import { IProfileRepository, Profile, CreateProfileDto, UpdateProfileDto } from '../interfaces/IProfileRepository';
import { supabase } from '../../config/supabase.config';
import { Logger } from '../../core/utils/logger.util';
import { NotFoundException, ConflictException } from '../../exceptions';

/**
 * Profile repository implementation
 */
export class ProfileRepository extends BaseRepository<Profile, CreateProfileDto, UpdateProfileDto> implements IProfileRepository {
  protected tableName = 'profiles';
  private logger = new Logger('ProfileRepository');

  async findById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error finding profile by id:', error);
      return null;
    }

    return data as Profile;
  }

  async findAll(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error finding all profiles:', error);
      return [];
    }

    return data as Profile[];
  }

  async create(dto: CreateProfileDto): Promise<Profile> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        user_id: dto.userId,
        first_name: dto.firstName,
        last_name: dto.lastName,
        phone: dto.phone,
        avatar: dto.avatar,
        date_of_birth: dto.dateOfBirth,
        preferences: dto.preferences
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating profile:', error);
      throw new ConflictException('Profile', dto.userId);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, dto: UpdateProfileDto): Promise<Profile> {
    const updateData: any = {};
    if (dto.firstName !== undefined) updateData.first_name = dto.firstName;
    if (dto.lastName !== undefined) updateData.last_name = dto.lastName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;
    if (dto.dateOfBirth !== undefined) updateData.date_of_birth = dto.dateOfBirth;
    if (dto.preferences !== undefined) updateData.preferences = dto.preferences;

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating profile:', error);
      throw new NotFoundException('Profile', id);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting profile:', error);
      return false;
    }

    return true;
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      this.logger.error('Error finding profile by user id:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async existsByUserId(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }

  private mapToEntity(data: any): Profile {
    return {
      id: data.id,
      userId: data.user_id,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      avatar: data.avatar,
      dateOfBirth: data.date_of_birth,
      preferences: data.preferences,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
