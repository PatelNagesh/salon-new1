/**
 * Validators module exports
 */

// Base validator
export * from './base.validator';

// Common validators
export * from './common.validators';

// Entity validators
export * from './auth.validator';
export * from './profile.validator';
export * from './salon.validator';
export * from './service.validator';
export * from './staff.validator';
export * from './customer.validator';
export * from './booking.validator';
export * from './vendor.validator';
export * from './product.validator';
export * from './inventory.validator';
export * from './order.validator';

// Re-export validator instances for convenience
export {
  authValidator,
} from './auth.validator';
export {
  profileValidator,
} from './profile.validator';
export {
  salonValidator,
} from './salon.validator';
export {
  serviceValidator,
} from './service.validator';
export {
  staffValidator,
} from './staff.validator';
export {
  customerValidator,
} from './customer.validator';
export {
  bookingValidator,
} from './booking.validator';
export {
  vendorValidator,
} from './vendor.validator';
export {
  productValidator,
} from './product.validator';
export {
  inventoryValidator,
} from './inventory.validator';
export {
  orderValidator,
} from './order.validator';
