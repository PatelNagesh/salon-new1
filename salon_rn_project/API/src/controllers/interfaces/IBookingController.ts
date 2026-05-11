import { IController } from '../../core/interfaces/IController';

/**
 * Booking controller interface
 */
export interface IBookingController extends IController {
  /**
   * Get booking by ID
   */
  getBooking(req: any, res: any): Promise<void>;

  /**
   * Get all bookings
   */
  getAllBookings(req: any, res: any): Promise<void>;

  /**
   * Create booking
   */
  createBooking(req: any, res: any): Promise<void>;

  /**
   * Update booking
   */
  updateBooking(req: any, res: any): Promise<void>;

  /**
   * Delete booking
   */
  deleteBooking(req: any, res: any): Promise<void>;

  /**
   * Confirm booking
   */
  confirmBooking(req: any, res: any): Promise<void>;

  /**
   * Cancel booking
   */
  cancelBooking(req: any, res: any): Promise<void>;

  /**
   * Get available time slots
   */
  getAvailableTimeSlots(req: any, res: any): Promise<void>;

  /**
   * Get bookings by customer
   */
  getBookingsByCustomer(req: any, res: any): Promise<void>;

  /**
   * Get bookings by staff
   */
  getBookingsByStaff(req: any, res: any): Promise<void>;
}
