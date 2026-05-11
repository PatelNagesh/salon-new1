import { BaseRepository } from '../../core/base/BaseRepository';
import { IServiceRepository, Service, CreateServiceDto, UpdateServiceDto } from '../interfaces/IServiceRepository';
import { supabase } from '../../config/supabase.config';
import { Logger } from '../../core/utils/logger.util';
import { NotFoundException, ConflictException } from '../../exceptions';

/**
 * Service repository implementation
 */
export class ServiceRepository extends BaseRepository<Service, CreateServiceDto, UpdateServiceDto> implements IServiceRepository {
  protected tableName = 'services';
  private logger = new Logger('ServiceRepository');

  async findById(id: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error finding service by id:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async findAll(): Promise<Service[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error finding all services:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async create(dto: CreateServiceDto): Promise<Service> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        salon_id: dto.salonId,
        name: dto.name,
        description: dto.description,
        duration: dto.duration,
        price: dto.price,
        category: dto.category,
        image: dto.image
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating service:', error);
      throw new ConflictException('Service', dto.name);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.duration !== undefined) updateData.duration = dto.duration;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.image !== undefined) updateData.image = dto.image;
    if (dto.status !== undefined) updateData.status = dto.status;

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating service:', error);
      throw new NotFoundException('Service', id);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting service:', error);
      return false;
    }

    return true;
  }

  async findBySalonId(salonId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('salon_id', salonId);

    if (error) {
      this.logger.error('Error finding services by salon id:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByCategory(category: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('category', category);

    if (error) {
      this.logger.error('Error finding services by category:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByStatus(status: 'active' | 'inactive' | 'archived'): Promise<Service[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('status', status);

    if (error) {
      this.logger.error('Error finding services by status:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Service[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .gte('price', minPrice)
      .lte('price', maxPrice);

    if (error) {
      this.logger.error('Error finding services by price range:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async existsByName(salonId: string, name: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('id')
      .eq('salon_id', salonId)
      .eq('name', name)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }

  private mapToEntity(data: any): Service {
    return {
      id: data.id,
      salonId: data.salon_id,
      name: data.name,
      description: data.description,
      duration: data.duration,
      price: data.price,
      category: data.category,
      image: data.image,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
