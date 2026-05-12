import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BaseController } from '../../../src/core/base/BaseController';
import { IController } from '../../../src/core/interfaces/IController';
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
 * Mock service
 */
class MockService {
  private data: Map<string, MockEntity> = new Map();

  async create(data: any): Promise<MockEntity> {
    if (!data.name || data.name.length < 2) {
      throw new ValidationException('Name must be at least 2 characters');
    }

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

  async update(id: string, data: any): Promise<MockEntity> {
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
}

/**
 * Mock request
 */
interface MockRequest {
  params?: any;
  body?: any;
  query?: any;
  headers?: any;
}

/**
 * Mock response
 */
interface MockResponse {
  statusCode: number;
  body: any;
  headers: any;
  status(code: number): MockResponse;
  json(data: any): void;
  send(data: any): void;
}

/**
 * Mock response implementation
 */
class MockResponseImpl implements MockResponse {
  statusCode = 200;
  body: any = null;
  headers: any = {};

  status(code: number): MockResponse {
    this.statusCode = code;
    return this;
  }

  json(data: any): void {
    this.body = data;
  }

  send(data: any): void {
    this.body = data;
  }
}

/**
 * Mock controller implementation
 */
class MockController extends BaseController<MockEntity, any, any> implements IController<MockEntity, any, any> {
  constructor(private service: MockService) {
    super();
  }

  async create(req: MockRequest, res: MockResponse): Promise<void> {
    try {
      const result = await this.service.create(req.body);
      res.status(201).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async findById(req: MockRequest, res: MockResponse): Promise<void> {
    try {
      const result = await this.service.findById(req.params.id);
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async findAll(req: MockRequest, res: MockResponse): Promise<void> {
    try {
      const result = await this.service.findAll(req.query);
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async update(req: MockRequest, res: MockResponse): Promise<void> {
    try {
      const result = await this.service.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async delete(req: MockRequest, res: MockResponse): Promise<void> {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }
}

describe('BaseController', () => {
  let controller: MockController;
  let service: MockService;

  beforeEach(() => {
    service = new MockService();
    controller = new MockController(service);
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('create', () => {
    it('should create entity and return 201', async () => {
      const req: MockRequest = {
        body: {
          name: 'Test Entity',
          value: 100
        }
      };
      const res = new MockResponseImpl();

      await controller.create(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.name).toBe('Test Entity');
    });

    it('should return 400 for invalid data', async () => {
      const req: MockRequest = {
        body: {
          name: 'X',
          value: 100
        }
      };
      const res = new MockResponseImpl();

      await controller.create(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('findById', () => {
    it('should find entity by ID and return 200', async () => {
      const created = await service.create({ name: 'Test', value: 100 });

      const req: MockRequest = {
        params: { id: created.id }
      };
      const res = new MockResponseImpl();

      await controller.findById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(created.id);
    });

    it('should return 404 for non-existent entity', async () => {
      const req: MockRequest = {
        params: { id: 'non-existent-id' }
      };
      const res = new MockResponseImpl();

      await controller.findById(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all entities with 200', async () => {
      await service.create({ name: 'Entity 1', value: 1 });
      await service.create({ name: 'Entity 2', value: 2 });

      const req: MockRequest = {};
      const res = new MockResponseImpl();

      await controller.findAll(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('should return empty array when no entities exist', async () => {
      const req: MockRequest = {};
      const res = new MockResponseImpl();

      await controller.findAll(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update entity and return 200', async () => {
      const created = await service.create({ name: 'Original', value: 100 });

      const req: MockRequest = {
        params: { id: created.id },
        body: { name: 'Updated', value: 200 }
      };
      const res = new MockResponseImpl();

      await controller.update(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated');
      expect(res.body.data.value).toBe(200);
    });

    it('should return 404 for non-existent entity', async () => {
      const req: MockRequest = {
        params: { id: 'non-existent-id' },
        body: { name: 'Updated' }
      };
      const res = new MockResponseImpl();

      await controller.update(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete entity and return 204', async () => {
      const created = await service.create({ name: 'Test', value: 100 });

      const req: MockRequest = {
        params: { id: created.id }
      };
      const res = new MockResponseImpl();

      await controller.delete(req, res);

      expect(res.statusCode).toBe(204);
    });

    it('should return 404 for non-existent entity', async () => {
      const req: MockRequest = {
        params: { id: 'non-existent-id' }
      };
      const res = new MockResponseImpl();

      await controller.delete(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle NotFoundException correctly', async () => {
      const req: MockRequest = {
        params: { id: 'non-existent-id' }
      };
      const res = new MockResponseImpl();

      await controller.findById(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it('should handle ValidationException correctly', async () => {
      const req: MockRequest = {
        body: { name: 'X', value: 100 }
      };
      const res = new MockResponseImpl();

      await controller.create(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('response format', () => {
    it('should return consistent response format for success', async () => {
      const req: MockRequest = {
        body: { name: 'Test', value: 100 }
      };
      const res = new MockResponseImpl();

      await controller.create(req, res);

      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should return consistent response format for errors', async () => {
      const req: MockRequest = {
        params: { id: 'non-existent-id' }
      };
      const res = new MockResponseImpl();

      await controller.findById(req, res);

      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('timestamp');
    });
  });
});
