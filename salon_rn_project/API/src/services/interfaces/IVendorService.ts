/**
  - Vendor Service Interface
  - Defines the contract for vendor-related business operations
   */

  import type { Vendor, CreateVendorDto, UpdateVendorDto, QueryOptions } from '../../core/types/common.types';

  export interface IVendorService {
    /**
  - Create a new vendor
     */
    create(dto: CreateVendorDto): Promise;

    /**
  - Find vendor by ID
     */
    findById(id: string): Promise;

    /**
  - Find all vendors with optional query options
     */
    findAll(options?: QueryOptions): Promise<Vendor[]>;

    /**
  - Update an existing vendor
     */
    update(id: string, dto: UpdateVendorDto): Promise;

    /**
  - Delete a vendor
     */
    delete(id: string): Promise;

    /**
  - Find vendors by salon ID
     */
    findBySalonId(salonId: string): Promise<Vendor[]>;

    /**
  - Find vendor by email
     */
    findByEmail(email: string): Promise<Vendor | null>;

    /**
  - Find vendor by phone
     */
    findByPhone(phone: string): Promise<Vendor | null>;

    /**
  - Get active vendors for a salon
     */
    getActiveVendors(salonId: string): Promise<Vendor[]>;

    /**
  - Activate a vendor
     */
    activate(id: string): Promise;

    /**
  - Deactivate a vendor
     */
    deactivate(id: string): Promise;
  }