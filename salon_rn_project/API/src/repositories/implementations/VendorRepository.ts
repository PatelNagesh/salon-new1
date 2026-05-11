import { BaseRepository } from '../../core/base/BaseRepository';
import { IVendorRepository, Vendor, CreateVendorDto, UpdateVendorDto } from '../interfaces/IVendorRepository';
import { supabase } from '../../config/supabase.config';
import { Logger } from '../../core/utils/logger.util';
import { NotFoundException, ConflictException } from '../../exceptions';

/**
 * Vendor repository implementation
 */
export class VendorRepository extends BaseRepository<Vendor, CreateVendorDto, UpdateVendorDto> implements IVendorRepository {
  protected tableName = 'vendors';
  private logger = new Logger('VendorRepository');

  async findById(id: string): Promise<Vendor | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error finding vendor by id:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async findAll(): Promise<Vendor[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error finding all vendors:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async create(dto: CreateVendorDto): Promise<Vendor> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        salon_id: dto.salonId,
        name: dto.name,
        contact_person: dto.contactPerson,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zip_code: dto.zipCode,
        website: dto.website,
        notes: dto.notes
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating vendor:', error);
      throw new ConflictException('Vendor', dto.email);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, dto: UpdateVendorDto): Promise<Vendor> {
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.contactPerson !== undefined) updateData.contact_person = dto.contactPerson;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.city !== undefined) updateData.city = dto.city;
    if (dto.state !== undefined) updateData.state = dto.state;
    if (dto.zipCode !== undefined) updateData.zip_code = dto.zipCode;
    if (dto.website !== undefined) updateData.website = dto.website;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating vendor:', error);
      throw new NotFoundException('Vendor', id);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting vendor:', error);
      return false;
    }

    return true;
  }

  async findBySalonId(salonId: string): Promise<Vendor[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('salon_id', salonId);

    if (error) {
      this.logger.error('Error finding vendors by salon id:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByEmail(email: string): Promise<Vendor | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      this.logger.error('Error finding vendor by email:', error);
      return null;
    }

    return this.mapToEntity(data);
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

  private mapToEntity(data: any): Vendor {
    return {
      id: data.id,
      salonId: data.salon_id,
      name: data.name,
      contactPerson: data.contact_person,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      website: data.website,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
