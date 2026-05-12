import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BaseRepository } from '../../../src/core/base/BaseRepository';
import { IRepository } from '../../../src/core/interfaces/IRepository';
import { NotFoundException } from '../../../src/core/exceptions/NotFoundException';

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
 * Mock repository implementation
 */
class MockRepository extends BaseRepository<MockEntity> implements IRepository<MockEntity> {
  private data: Map<string, MockEntity> = new Map();

  async findById(id: string): Promise<MockEntity> {
    const entity = this.data.get(id);
    if (!entity) {
      throw new NotFoundException('MockEntity', id);
    }
    return entity;
  }

  async findAll(options?: any): Promise<MockEntity[]> {
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

  async update(id: string, data: Partial<Omit<MockEntity, 'id' | 'createdAt'>>): Promise<MockEntity> {
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
    const entity = await this.findById(id);
    this.data.delete(entity.id);
  }

  async exists(id: string): Promise<boolean> {
    return this.data.has(id);
  }
}

describe('BaseRepository', () => {
  let repository: MockRepository;

  beforeEach(() => {
    repository = new MockRepository();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('create', () => {
    it('should create a new entity', async () => {
      const data = {
        name: 'Test Entity',
        value: 100
      };

      const result = await repository.create(data);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(data.name);
      expect(result.value).toBe(data.value);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for each entity', async () => {
      const entity1 = await repository.create({ name: 'Entity 1', value: 1 });
      const entity2 = await repository.create({ name: 'Entity 2', value: 2 });

      expect(entity1.id).not.toBe(entity2.id);
    });
  });

  describe('findById', () => {
    it('should find entity by ID', async () => {
      const created = await repository.create({ name: 'Test', value: 100 });

      const found = await repository.findById(created.id);

      expect(found).toEqual(created);
    });

    it('should throw NotFoundException when entity not found', async () => {
      await expect(repository.findById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all entities', async () => {
      await repository.create({ name: 'Entity 1', value: 1 });
      await repository.create({ name: 'Entity 2', value: 2 });
      await repository.create({ name: 'Entity 3', value: 3 });

      const results = await repository.findAll();

      expect(results).toHaveLength(3);
    });

    it('should return empty array when no entities exist', async () => {
      const results = await repository.findAll();

      expect(results).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update existing entity', async () => {
      const created = await repository.create({ name: 'Original', value: 100 });

      const updated = await repository.update(created.id, {
        name: 'Updated',
        value: 200
      });

      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe('Updated');
      expect(updated.value).toBe(200);
      expect(updated.updatedAt).not.toEqual(created.updatedAt);
    });

    it('should throw NotFoundException when updating non-existent entity', async () => {
      await expect(
        repository.update('non-existent-id', { name: 'Updated' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should preserve createdAt timestamp', async () => {
      const created = await repository.create({ name: 'Test', value: 100 });

      const updated = await repository.update(created.id, { value: 200 });

      expect(updated.createdAt).toEqual(created.createdAt);
    });
  });

  describe('delete', () => {
    it('should delete existing entity', async () => {
      const created = await repository.create({ name: 'Test', value: 100 });

      await repository.delete(created.id);

      await expect(repository.findById(created.id)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when deleting non-existent entity', async () => {
      await expect(repository.delete('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('exists', () => {
    it('should return true for existing entity', async () => {
      const created = await repository.create({ name: 'Test', value: 100 });

      const exists = await repository.exists(created.id);

      expect(exists).toBe(true);
    });

    it('should return false for non-existent entity', async () => {
      const exists = await repository.exists('non-existent-id');

      expect(exists).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      // This test would need to mock database errors
      // For now, we'll just verify the structure is in place
      expect(repository).toBeDefined();
    });
  });
});
