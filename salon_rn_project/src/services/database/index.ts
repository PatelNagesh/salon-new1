// Database Services Export
export { ProfileService } from './ProfileService';
export { SalonService } from './SalonService';
export { ServiceService } from './ServiceService';
export { StaffService } from './StaffService';
export { CustomerService } from './CustomerService';
export { BookingService } from './BookingService';
export { VendorService } from './VendorService';
export { ProductService } from './ProductService';
export { InventoryService } from './InventoryService';
export { OrderService } from './OrderService';

// Re-export types
export type { Profile, ProfileInsert, ProfileUpdate } from './ProfileService';
export type { Salon, SalonInsert, SalonUpdate } from './SalonService';
export type { Service, ServiceInsert, ServiceUpdate } from './ServiceService';
export type { StaffMember, StaffMemberInsert, StaffMemberUpdate, StaffSchedule, StaffScheduleInsert, StaffScheduleUpdate } from './StaffService';
export type { Customer, CustomerInsert, CustomerUpdate } from './CustomerService';
export type { Booking, BookingInsert, BookingUpdate } from './BookingService';
export type { Vendor, VendorInsert, VendorUpdate } from './VendorService';
export type { Product, ProductInsert, ProductUpdate } from './ProductService';
export type { Inventory, InventoryInsert, InventoryUpdate } from './InventoryService';
export type { Order, OrderInsert, OrderUpdate, OrderItem, OrderItemInsert, OrderItemUpdate } from './OrderService';
