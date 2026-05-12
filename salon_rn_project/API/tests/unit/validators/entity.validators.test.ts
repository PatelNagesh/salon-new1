import { describe, it, expect } from '@jest/globals';
import {
  authValidator,
  profileValidator,
  salonValidator,
  serviceValidator,
  staffValidator,
  customerValidator,
  bookingValidator,
  vendorValidator,
  productValidator,
  inventoryValidator,
  orderValidator,
} from '../validators';

describe('Auth Validator', () => {
  it('should validate login request', () => {
    const data = {
      email: 'test@example.com',
      password: 'Password123',
    };

    const result = authValidator.validateLogin(data);
    expect(result).toEqual(data);
  });

  it('should reject invalid login email', () => {
    const data = {
      email: 'invalid-email',
      password: 'Password123',
    };

    expect(() => authValidator.validateLogin(data)).toThrow();
  });

  it('should validate register request', () => {
    const data = {
      email: 'test@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = authValidator.validateRegister(data);
    expect(result).toEqual(data);
  });

  it('should reject weak password in register', () => {
    const data = {
      email: 'test@example.com',
      password: 'weak',
      firstName: 'John',
      lastName: 'Doe',
    };

    expect(() => authValidator.validateRegister(data)).toThrow();
  });

  it('should validate reset password with matching passwords', () => {
    const data = {
      token: 'valid-token',
      password: 'NewPassword123',
      confirmPassword: 'NewPassword123',
    };

    const result = authValidator.validateResetPassword(data);
    expect(result).toEqual(data);
  });

  it('should reject reset password with mismatched passwords', () => {
    const data = {
      token: 'valid-token',
      password: 'NewPassword123',
      confirmPassword: 'DifferentPassword123',
    };

    expect(() => authValidator.validateResetPassword(data)).toThrow();
  });
});

describe('Profile Validator', () => {
  it('should validate create profile request', () => {
    const data = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    const result = profileValidator.validateCreate(data);
    expect(result).toEqual(data);
  });

  it('should validate update profile request', () => {
    const data = {
      firstName: 'Jane',
    };

    const result = profileValidator.validateUpdate(data);
    expect(result).toEqual(data);
  });

  it('should reject invalid UUID in profile', () => {
    const data = {
      userId: 'invalid-uuid',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    expect(() => profileValidator.validateCreate(data)).toThrow();
  });
});

describe('Salon Validator', () => {
  it('should validate create salon request', () => {
    const data = {
      ownerId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Salon',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      phone: '+1 (555) 123-4567',
      email: 'salon@example.com',
    };

    const result = salonValidator.validateCreate(data);
    expect(result).toEqual(data);
  });

  it('should validate update salon request', () => {
    const data = {
      name: 'Updated Salon',
      status: 'active',
    };

    const result = salonValidator.validateUpdate(data);
    expect(result).toEqual(data);
  });

  it('should reject invalid state code', () => {
    const data = {
      ownerId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Salon',
      address: '123 Main St',
      city: 'New York',
      state: 'NYC',
      zipCode: '10001',
      phone: '+1 (555) 123-4567',
      email: 'salon@example.com',
    };

    expect(() => salonValidator.validateCreate(data)).toThrow();
  });
});

describe('Service Validator', () => {
  it('should validate create service request', () => {
    const data = {
      salonId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Haircut',
      duration: 30,
      price: 50,
      category: 'Hair',
    };

    const result = serviceValidator.validateCreate(data);
    expect(result).toEqual(data);
  });

  it('should validate update service request', () => {
    const data = {
      price: 60,
      status: 'active',
    };

    const result = serviceValidator.validateUpdate(data);
    expect(result).toEqual(data);
  });

  it('should reject duration that is too short', () => {
    const data = {
      salonId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Haircut',
      duration: 4,
      price: 50,
      category: 'Hair',
    };

    expect(() => serviceValidator.validateCreate(data)).toThrow();
  });
});

describe('Staff Validator', () => {
  it('should validate create staff request', () => {
    const data = {
      salonId: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'staff',
    };

    const result = staffValidator.validateCreate(data);
    expect(result).toEqual(data);
  });

  it('should validate update staff request', () => {
    const data = {
      status: 'active',
    };

    const result = staffValidator.validateUpdate(data);
    expect(result).toEqual(data);
  });

  it('should reject invalid role', () => {
    const data = {
      salonId: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'invalid',
    };

    expect(() => staffValidator.validateCreate(data)).toThrow();
  });
});

describe('Customer Validator', () => {
  it('should validate create customer request', () => {
    const data = {
      salonId: '550e8400-e29b-41d4-a716-446655440000',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    const result = customerValidator.validateCreate(data);
    expect(result).toEqual(data);
  });

  it('should validate update customer request', () => {
    const data = {
      status: 'active',
    };

    const result = customerValidator.validateUpdate(data);
    expect(result).toEqual(data);
  });

  it('should reject invalid status', () => {
    const data = {
      status: 'invalid',
    };

    expect(() => customerValidator.validateUpdate(data)).toThrow();
  });
});

describe('Booking Validator', () => {
  it('should validate create booking request', () => {
    const data = {
      salonId: '550e8400-e29b-41d4-a716-446655440000',
      customerId: '550e8400-e29b-41d4-a716-446655440001',
      staffId: '550e8400-e29b-41d4-a716-446655440002',
      serviceId: '550e8400-e29b-41d4-a716-446655440003',
      appointmentDate: '2026-05-12',
      startTime: '10:00',
      endTime: '10:30',
    };

    const result = bookingValidator.validateCreate(data);
    expect(result).toEqual(data);
  });

  it('should reject booking with end time before start time', () => {
    const data = {
      salonId: '550e8400-e29b-41d4-a716-446655440000',
      customerId: '550e8400-e29b-41d4-a716-446655440001',
      staffId: '550e8400-e29b-41d4-a716-446655440002',
      serviceId: '550e8400-e29b-41d4-a716-446655440003',
      appointmentDate: '2026-05-12',
      startTime: '10:30',
      endTime: '10:00',
    };

    expect(() => bookingValidator.validateCreate(data)).toThrow();
  });

  it('should validate update booking request', () => {
    const data = {
      status: 'confirmed',
    };

    const result = bookingValidator.validateUpdate(data);
    expect(result).toEqual(data);
  });
});

describe('Vendor Validator', () => {
  it('should validate create vendor request', () => {
    const data = {
      salonId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Vendor',
      contactPerson: 'John Doe',
      email: 'vendor@example.com',
    };

    const result = vendorValidator.validateCreate(data);
    expect(result).toEqual(data);
  });

  it('should validate update vendor request', () => {
    const data = {
      name: 'Updated Vendor',
    };

    const result = vendorValidator.validateUpdate(data);
    expect(result).toEqual(data);
  });
});

describe('Product Validator', () => {
  it('should validate create product request', () => {
    const data = {
      salonId: '550e8400-e29b-41d4-a716-446655440000',
      vendorId: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Product',
      sku: 'SKU-001',
      price: 99.99,
      category: 'Hair Care',
      unit: 'bottle',
    };

    const result = productValidator.validateCreate(data);
    expect(result).toEqual(data);
  });

  it('should validate update product request', () => {
    const data = {
      price: 109.99,
      status: 'active',
    };

    const result = productValidator.validateUpdate(data);
    expect(result).toEqual(data);
  });

  it('should reject negative price', () => {
    const data = {
      salonId: '550e8400-e29b-41d4-a716-446655440000',
      vendorId: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Product',
      sku: 'SKU-001',
      price: -10,
      category: 'Hair Care',
      unit: 'bottle',
    };

    expect(() => productValidator.validateCreate(data)).toThrow();
  });
});

describe('Inventory Validator', () => {
  it('should validate create inventory request', () => {
    const data = {
      salonId: '550e8400-e29b-41d4-a716-446655440000',
      productId: '550e8400-e29b-41d4-a716-446655440001',
      quantity: 10,
    };

    const result = inventoryValidator.validateCreate(data);
    expect(result).toEqual(data);
  });

  it('should validate update inventory request', () => {
    const data = {
      quantity: 15,
    };

    const result = inventoryValidator.validateUpdate(data);
    expect(result).toEqual(data);
  });

  it('should reject negative quantity', () => {
    const data = {
      salonId: '550e8400-e29b-41d4-a716-446655440000',
      productId: '550e8400-e29b-41d4-a716-446655440001',
      quantity: -5,
    };

    expect(() => inventoryValidator.validateCreate(data)).toThrow();
  });
});

describe('Order Validator', () => {
  it('should validate create order request', () => {
    const data = {
      salonId: '550e8400-e29b-41d4-a716-446655440000',
      vendorId: '550e8400-e29b-41d4-a716-446655440001',
      orderDate: '2026-05-12',
    };

    const result = orderValidator.validateCreate(data);
    expect(result).toEqual(data);
  });

  it('should validate update order request', () => {
    const data = {
      status: 'received',
    };

    const result = orderValidator.validateUpdate(data);
    expect(result).toEqual(data);
  });

  it('should reject invalid status', () => {
    const data = {
      status: 'invalid',
    };

    expect(() => orderValidator.validateUpdate(data)).toThrow();
  });
});
