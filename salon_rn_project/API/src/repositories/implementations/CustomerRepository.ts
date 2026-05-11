import { BaseRepository } from '../../core/base/BaseRepository';
import { ICustomerRepository, Customer, CreateCustomerDto, UpdateCustomerDto } from '../interfaces/ICustomerRepository';
import { supabase } from '../../config/supabase.config';
import { Logger } from '../../core/utils/logger.util';
import { NotFoundException, ConflictException } from '../../exceptions';

/**
 * Customer repository implementation
 */
export class CustomerRepository extends BaseRepository<Customer, CreateCustomerDto, UpdateCustomerDto> implements ICustomerRepository {
  protected tableName = 'customers';
  private logger = new Logger('CustomerRepository');

  async findById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error finding customer by id:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async findAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error finding all customers:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        user_id: dto.userId,
        first_name: dto.firstName,
        last_name: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zip_code: dto.zipCode,
        preferences: dto.preferences,
        notes: dto.notes
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating customer:', error);
      throw new ConflictException('Customer', dto.email);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const updateData: any = {};
    if (dto.firstName !== undefined) updateData.first_name = dto.firstName;
    if (dto.lastName !== undefined) updateData.last_name = dto.lastName;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.city !== undefined) updateData.city = dto.city;
    if (dto.state !== undefined) updateData.state = dto.state;
    if (dto.zipCode !== undefined) updateData.zip_code = dto.zipCode;
    if (dto.preferences !== undefined) updateData.preferences = dto.preferences;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.status !== undefined) updateData.status = dto.status;

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating customer:', error);
      throw new NotFoundException('Customer', id);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting customer:', error);
      return false;
    }

    return true;
  }

  async findByUserId(userId: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      this.logger.error('Error finding customer by user id:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      this.logger.error('Error finding customer by email:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async findByStatus(status: 'active' | 'inactive' | 'blocked'): Promise<Customer[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('status', status);

    if (error) {
      this.logger.error('Error finding customers by status:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByCity(city: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .ilike('city', `%${city}%`);

    if (error) {
      this.logger.error('Error finding customers by city:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async existsByEmail(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('id')
      .eq('email', email)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }

  private mapToEntity(data: any): Customer {
    return {
      id: data.id,
      userId: data.user_id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      preferences: data.preferences,
      notes: data.notes,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
