/**
 * Customer management service interface
 */
export interface ICustomerManagementService {
  /**
   * Get customer profile
   */
  getCustomerProfile(customerId: string): Promise<any>;

  /**
   * Update customer profile
   */
  updateCustomerProfile(customerId: string, profileData: any): Promise<any>;

  /**
   * Get customer preferences
   */
  getCustomerPreferences(customerId: string): Promise<any>;

  /**
   * Update customer preferences
   */
  updateCustomerPreferences(customerId: string, preferences: any): Promise<any>;

  /**
   * Get customer booking history
   */
  getCustomerBookingHistory(customerId: string, filters?: any): Promise<any[]>;

  /**
   * Get customer statistics
   */
  getCustomerStatistics(customerId: string): Promise<any>;

  /**
   * Search customers
   */
  searchCustomers(query: string, filters?: any): Promise<any[]>;

  /**
   * Block customer
   */
  blockCustomer(customerId: string, reason: string): Promise<any>;

  /**
   * Unblock customer
   */
  unblockCustomer(customerId: string): Promise<any>;
}
