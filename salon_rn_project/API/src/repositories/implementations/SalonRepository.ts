import { BaseRepository } from '../../core/base/BaseRepository';
import { ISalonRepository, Salon, CreateSalonDto, UpdateSalonDto } from '../interfaces/ISalonRepository';
import { supabase } from '../../config/supabase.config';
import { Logger } from '../../core/utils/logger.util';
import { NotFoundException, ConflictException } from '../../exceptions';

/**
 * Salon repository implementation
 */
export class SalonRepository extends BaseRepository<Salon, CreateSalonDto, UpdateSalonDto> implements ISalonRepository {
  protected tableName = 'salons';
  private logger = new Logger('SalonRepository');

  async findById(id: string): Promise<Salon | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error finding salon by id:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async findAll(): Promise<Salon[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error finding all salons:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async create(dto: CreateSalonDto): Promise<Salon> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        owner_id: dto.ownerId,
        name: dto.name,
        description: dto.description,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zip_code: dto.zipCode,
        phone: dto.phone,
        email: dto.email,
        website: dto.website,
        logo: dto.logo,
        opening_hours: dto.openingHours
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating salon:', error);
      throw new ConflictException('Salon', dto.name);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, dto: UpdateSalonDto): Promise<Salon> {
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.city !== undefined) updateData.city = dto.city;
    if (dto.state !== undefined) updateData.state = dto.state;
    if (dto.zipCode !== undefined) updateData.zip_code = dto.zipCode;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.website !== undefined) updateData.website = dto.website;
    if (dto.logo !== undefined) updateData.logo = dto.logo;
    if (dto.openingHours !== undefined) updateData.opening_hours = dto.openingHours;
    if (dto.status !== undefined) updateData.status = dto.status;

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating salon:', error);
      throw new NotFoundException('Salon', id);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting salon:', error);
      return false;
    }

    return true;
  }

  async findByOwnerId(ownerId: string): Promise<Salon[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', ownerId);

    if (error) {
      this.logger.error('Error finding salons by owner id:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByCity(city: string): Promise<Salon[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('city', city);

    if (error) {
      this.logger.error('Error finding salons by city:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByStatus(status: 'active' | 'inactive' | 'suspended'): Promise<Salon[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('status', status);

    if (error) {
      this.logger.error('Error finding salons by status:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async existsByName(name: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('id')
      .eq('name', name)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }

  private mapToEntity(data: any): Salon {
    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      description: data.description,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      phone: data.phone,
      email: data.email,
      website: data.website,
      logo: data.logo,
      openingHours: data.opening_hours,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
