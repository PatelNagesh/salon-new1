/**
 * Booking flow service interface
 */
export interface IBookingFlowService {
  /**
   * Get available time slots for a service and staff
   */
  getAvailableTimeSlots(serviceId: string, staffId: string, date: string): Promise<string[]>;

  /**
   * Check if a booking slot is available
   */
  checkAvailability(staffId: string, date: string, timeSlot: string, duration: number): Promise<boolean>;

  /**
   * Create a booking
   */
  createBooking(bookingData: any): Promise<any>;

  /**
   * Confirm a booking
   */
  confirmBooking(bookingId: string): Promise<any>;

  /**
   * Cancel a booking
   */
  cancelBooking(bookingId: string, reason?: string): Promise<any>;

  /**
   * Reschedule a booking
   */
  rescheduleBooking(bookingId: string, newDate: string, newTimeSlot: string): Promise<any>;

  /**
   * Get booking history for a customer
   */
  getBookingHistory(customerId: string, limit?: number): Promise<any[]>;

  /**
   * Get upcoming bookings for a customer
   */
  getUpcomingBookings(customerId: string): Promise<any[]>;

  /**
   * Get bookings for a staff member
   */
  getStaffBookings(staffId: string, date?: string): Promise<any[]>;
}
