/**
 * Staff management service interface
 */
export interface IStaffManagementService {
  /**
   * Get staff profile
   */
  getStaffProfile(staffId: string): Promise<any>;

  /**
   * Update staff profile
   */
  updateStaffProfile(staffId: string, profileData: any): Promise<any>;

  /**
   * Get staff schedule
   */
  getStaffSchedule(staffId: string, startDate: string, endDate: string): Promise<any[]>;

  /**
   * Update staff schedule
   */
  updateStaffSchedule(staffId: string, scheduleData: any): Promise<any>;

  /**
   * Get staff performance
   */
  getStaffPerformance(staffId: string, startDate: string, endDate: string): Promise<any>;

  /**
   * Get staff bookings
   */
  getStaffBookings(staffId: string, date?: string): Promise<any[]>;

  /**
   * Assign staff to service
   */
  assignStaffToService(staffId: string, serviceId: string): Promise<any>;

  /**
   * Remove staff from service
   */
  removeStaffFromService(staffId: string, serviceId: string): Promise<any>;

  /**
   * Get staff specializations
   */
  getStaffSpecializations(staffId: string): Promise<string[]>;

  /**
   * Update staff specializations
   */
  updateStaffSpecializations(staffId: string, specializations: string[]): Promise<any>;

  /**
   * Calculate staff commission
   */
  calculateStaffCommission(staffId: string, startDate: string, endDate: string): Promise<any>;
}
