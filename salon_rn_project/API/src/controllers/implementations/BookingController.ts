import { BaseController } from '../../core/base/BaseController';
import { IBookingController } from '../interfaces/IBookingController';
import { IBookingFlowService } from '../../services/interfaces/IBookingFlowService';
import { Logger } from '../../core/utils/logger.util';
import { HttpStatus } from '../../constants/error.constants';

/**
 * Booking controller implementation
 */
export class BookingController extends BaseController implements IBookingController {
  constructor(
    private bookingFlowService: IBookingFlowService
  ) {
    super();
    this.logger = new Logger('BookingController');
  }

  async getBooking(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const booking = await this.bookingFlowService.getBookingById(id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: booking,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getAllBookings(req: any, res: any): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;

      const bookings = await this.bookingFlowService.getAllBookings();

      res.status(HttpStatus.OK).json({
        success: true,
        data: bookings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: bookings.length,
          totalPages: Math.ceil(bookings.length / Number(limit))
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async createBooking(req: any, res: any): Promise<void> {
    try {
      const bookingData = req.body;

      const booking = await this.bookingFlowService.createBooking(bookingData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: booking,
        message: 'Booking created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateBooking(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const bookingData = req.body;

      const booking = await this.bookingFlowService.updateBooking(id, bookingData);

      res.status(HttpStatus.OK).json({
        success: true,
        data: booking,
        message: 'Booking updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteBooking(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      await this.bookingFlowService.deleteBooking(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Booking deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async confirmBooking(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const booking = await this.bookingFlowService.confirmBooking(id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: booking,
        message: 'Booking confirmed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async cancelBooking(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const booking = await this.bookingFlowService.cancelBooking(id, reason);

      res.status(HttpStatus.OK).json({
        success: true,
        data: booking,
        message: 'Booking cancelled successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getAvailableTimeSlots(req: any, res: any): Promise<void> {
    try {
      const { serviceId, staffId, date } = req.query;

      const timeSlots = await this.bookingFlowService.getAvailableTimeSlots(
        serviceId,
        staffId,
        date
      );

      res.status(HttpStatus.OK).json({
        success: true,
        data: timeSlots,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getBookingsByCustomer(req: any, res: any): Promise<void> {
    try {
      const { customerId } = req.params;

      const bookings = await this.bookingFlowService.getBookingHistory(customerId);

      res.status(HttpStatus.OK).json({
        success: true,
        data: bookings,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getBookingsByStaff(req: any, res: any): Promise<void> {
    try {
      const { staffId } = req.params;
      const { date } = req.query;

      const bookings = await this.bookingFlowService.getStaffBookings(staffId, date);

      res.status(HttpStatus.OK).json({
        success: true,
        data: bookings,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
