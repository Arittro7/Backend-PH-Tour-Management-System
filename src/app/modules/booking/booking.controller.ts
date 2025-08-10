import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { BookingService } from "./booking.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload
  const booking = await BookingService.createBooking(req.body, decodedToken.userId)

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Booking created successfully",
    data: booking
  })
})

const getAllBookings = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query as Record<string, string>;

    const result = await BookingService.getAllBookings(query);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Booking created",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getUserBookings = catchAsync(async(req: Request, res: Response) =>{
  const query = req.query as Record<string, string>;
    const user = req.user as JwtPayload;

    const result = await BookingService.getUserBookings(query, user.userId);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Booking created",
      data: result.data,
      meta: result.meta,
    });
  }
);

// const getSingleBooking = catchAsync(async(req: Request, res: Response) =>{
//   const booking = await BookingService.getSingleBookingById()

//   sendResponse(res,{
//     statusCode: 200,
//     success:true,
//     message: "Booking retrieved Successfully",
//     data: booking
//   })
// })

const updateBookingStatus = catchAsync(async(req: Request, res: Response) =>{
  const _id = req.params.id;

    const result = await BookingService.updateBookingStatus(_id, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Booking created",
      data: result.data,
    });
  }
);

export const BookingController = {
  createBooking,
  getAllBookings,
  // getSingleBooking,
  getUserBookings,
  updateBookingStatus
}