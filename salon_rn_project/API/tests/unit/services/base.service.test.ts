import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BaseService } from '../../../src/core/base/BaseService';
import { IService } from '../../../src/core/interfaces/IService';
import { NotFoundException } from '../../../src/core/exceptions/NotFoundException';
import { ValidationException } from '../../../src/core/exceptions/ValidationException';

/**
 * Mock entity for testing
 */
interface MockEntity {
  id: string;
  name: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mock repository
 */
class MockRepository {
  private data: Map<string, MockEntity> = new Map();

  async findById(id: string): Promise<MockEntity> {
    const entity = this.data.get(id);
    if (!entity) {
      throw new NotFoundException('MockEntity', id);
    }
    return entity;
  }

  async findAll(): Promise<MockEntity[]> {
    return Array.from(this.data.values());
  }

  async create(data: Omit<MockEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<MockEntity> {
    const id = 'mock-id-' + Date.now();
    const now = new Date();
    const entity: MockEntity = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now
    };
    this.data.set(id, entity);
    return entity;
  }

  async update(id: string, data: Partial<MockEntity>): Promise<MockEntity> {
    const existing = await this.findById(id);
    const updated: MockEntity = {
      ...existing,
      ...data,
      updatedAt: new Date()
    };
    this.data.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    this.data.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.data.has(id);
  }
}

/**
 * Mock service implementation
 */
class MockService extends BaseService<MockEntity, any, any> implements IService<MockEntity, any, any> {
  constructor(private repository: MockRepository) {
    super();
  }

  async create(data: any): Promise<MockEntity> {
    // Business logic validation
    if (!data.name || data.name.length < 2) {
      throw new ValidationException('Name must be at least 2 characters');
    }

    if (data.value < 0) {
      throw new ValidationException('Value must be non-negative');
    }

    return this.repository.create(data);
  }

  async findById(id: string): Promise<MockEntity> {
    return this.repository.findById(id);
  }

  async findAll(options?: any): Promise<MockEntity[]> {
    return this.repository.findAll();
  }

  async update(id: string, data: any): Promise<MockEntity> {
    // Business logic validation
    if (data.name !== undefined && data.name.length < 2) {
      throw new ValidationException('Name must be at least 2 characters');
    }

    if (data.value !== undefined && data.value < 0) {
      throw new ValidationException('Value must be non-negative');
    }

    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}

describe('BaseService', () => {
  let service: MockService;
  let repository: MockRepository;

  beforeEach(() => {
    repository = new MockRepository();
    service = new MockService(repository);
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('create', () => {
    it('should create entity with business logic validation', async () => {
      const data = {
        name: 'Test Entity',
        value: 100
      };

      const result = await service.create(data);

      expect(result).toBeDefined();
      expect(result.name).toBe(data.name);
      expect(result.value).toBe(data.value);
    });

    it('should throw ValidationException for invalid name', async () => {
      const data = {
        name: 'X',
        value: 100
      };

      await expect(service.create(data)).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException for negative value', async () => {
      const data = {
        name: 'Test',
        value: -10
      };

      await expect(service.create(data)).rejects.toThrow(ValidationException);
    });
  });

  describe('findById', () => {
    it('should find entity by ID', async () => {
      const created = await service.create({ name: 'Test', value: 100 });

      const found = await service.findById(created.id);

      expect(found).toEqual(created);
    });

    it('should throw NotFoundException when entity not found', async () => {
      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all entities', async () => {
      await service.create({ name: 'Entity 1', value: 1 });
      await service.create({ name: 'Entity 2', value: 2 });
      await service.create({ name: 'Entity 3', value: 3 });

      const results = await service.findAll();

      expect(results).toHaveLength(3);
    });

    it('should return empty array when no entities exist', async () => {
      const results = await service.findAll();

      expect(results).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update existing entity with validation', async () => {
      const created = await service.create({ name: 'Original', value: 100 });

      const updated = await service.update(created.id, {
        name: 'Updated',
        value: 200
      });

      expect(updated.name).toBe('Updated');
      expect(updated.value).toBe(200);
    });

    it('should throw ValidationException for invalid update', async () => {
      const created = await service.create({ name: 'Test', value: 100 });

      await expect(
        service.update(created.id, { name: 'X' })
      ).rejects.toThrow(ValidationException);
    });

    it('should throw NotFoundException when updating non-existent entity', async () => {
      await expect(
        service.update('non-existent-id', { name: 'Updated' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing entity', async () => {
      const created = await service.create({ name: 'Test', value: 100 });

      await service.delete(created.id);

      await expect(service.findById(created.id)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when deleting non-existent entity', async () => {
      await expect(service.delete('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('business logic', () => {
    it('should enforce business rules', async () => {
      // Test that business logic is enforced
      const validData = { name: 'Valid Name', value: 100 };
      const result = await service.create(validData);

      expect(result).toBeDefined();
    });

    it('should reject invalid business data', async () => {
      const invalidData = { name: 'X', value: -10 };

      await expect(service.create(invalidData)).rejects.toThrow();
    });
  });
});
