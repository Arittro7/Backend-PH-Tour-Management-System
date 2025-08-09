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



const getAllBookings = catchAsync(async( req: Request, res: Response) => {
  const bookings = await BookingService.getAllBookings()
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bookings retrieved Successfully",
    data: bookings
  })
})


const getUserBookings = catchAsync(async(req: Request, res: Response) =>{
  const bookings = await BookingService.getUserBookings()  

  sendResponse(res,{
    statusCode: 200,
    success:true,
    message: "Successfully",
    data: bookings
  })
})

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
  const updated = await BookingService.updateBookingStatus()  

  sendResponse(res,{
    statusCode: 200,
    success:true,
    message: "Successfully",
    data: updated
  })
})

export const BookingController = {
  createBooking,
  getAllBookings,
  // getSingleBooking,
  getUserBookings,
  updateBookingStatus
}