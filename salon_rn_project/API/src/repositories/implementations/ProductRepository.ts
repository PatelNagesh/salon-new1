import { BaseRepository } from '../../core/base/BaseRepository';
import { IProductRepository, Product, CreateProductDto, UpdateProductDto } from '../interfaces/IProductRepository';
import { supabase } from '../../config/supabase.config';
import { Logger } from '../../core/utils/logger.util';
import { NotFoundException, ConflictException } from '../../exceptions';

/**
 * Product repository implementation
 */
export class ProductRepository extends BaseRepository<Product, CreateProductDto, UpdateProductDto> implements IProductRepository {
  protected tableName = 'products';
  private logger = new Logger('ProductRepository');

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error finding product by id:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async findAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error finding all products:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        vendor_id: dto.vendorId,
        name: dto.name,
        description: dto.description,
        sku: dto.sku,
        barcode: dto.barcode,
        category: dto.category,
        unit: dto.unit,
        cost_price: dto.costPrice,
        selling_price: dto.sellingPrice,
        min_stock_level: dto.minStockLevel,
        max_stock_level: dto.maxStockLevel,
        image: dto.image
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating product:', error);
      throw new ConflictException('Product', dto.sku || dto.name);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.sku !== undefined) updateData.sku = dto.sku;
    if (dto.barcode !== undefined) updateData.barcode = dto.barcode;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.unit !== undefined) updateData.unit = dto.unit;
    if (dto.costPrice !== undefined) updateData.cost_price = dto.costPrice;
    if (dto.sellingPrice !== undefined) updateData.selling_price = dto.sellingPrice;
    if (dto.minStockLevel !== undefined) updateData.min_stock_level = dto.minStockLevel;
    if (dto.maxStockLevel !== undefined) updateData.max_stock_level = dto.maxStockLevel;
    if (dto.image !== undefined) updateData.image = dto.image;
    if (dto.status !== undefined) updateData.status = dto.status;

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating product:', error);
      throw new NotFoundException('Product', id);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting product:', error);
      return false;
    }

    return true;
  }

  async findByVendorId(vendorId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('vendor_id', vendorId);

    if (error) {
      this.logger.error('Error finding products by vendor id:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findBySku(sku: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('sku', sku)
      .single();

    if (error) {
      this.logger.error('Error finding product by sku:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (error) {
      this.logger.error('Error finding product by barcode:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async findByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('category', category);

    if (error) {
      this.logger.error('Error finding products by category:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByStatus(status: 'active' | 'inactive' | 'discontinued'): Promise<Product[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('status', status);

    if (error) {
      this.logger.error('Error finding products by status:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async existsBySku(sku: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('id')
      .eq('sku', sku)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }

  private mapToEntity(data: any): Product {
    return {
      id: data.id,
      vendorId: data.vendor_id,
      name: data.name,
      description: data.description,
      sku: data.sku,
      barcode: data.barcode,
      category: data.category,
      unit: data.unit,
      costPrice: data.cost_price,
      sellingPrice: data.selling_price,
      minStockLevel: data.min_stock_level,
      maxStockLevel: data.max_stock_level,
      image: data.image,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
