/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import httpStatus from "http-status-codes";
import { Booking } from "./booking.model";
import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Tour } from "../tour/tour.model";
import { SSlService } from "../SSLCommerz/sslCommerz.service";
import { ISSLCommerz } from "../SSLCommerz/sslCommerz.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";

const getTransactionId = () => {
  return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

const createBooking = async (payload: Partial<IBooking>, userId: string) => {
  const transactionId = getTransactionId();

  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId);

    if (!user?.phone || !user.address) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Please Update Your Profile to Book a tour"
      );
    }

    const tour = await Tour.findById(payload.tour).select("costFrom");

    if (!tour?.costFrom) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "No Tour Cost defined Please inform the Authority"
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const amount = Number(tour.costFrom) * Number(payload.guestCount!);

    // create-booking
    const booking = await Booking.create([{
      user: userId,
      status: BOOKING_STATUS.PENDING,
      ...payload,
    }],{session}); 

    const payment = await Payment.create([{
      booking: booking[0]._id,
      status: PAYMENT_STATUS.UNPAID,
      transactionId: transactionId,
      amount: amount,
    }],{session}); 

    // update-booking after payment made
    const updatedBooking = await Booking.findByIdAndUpdate(
      booking[0]._id,
      { payment: payment[0]._id },
      { new: true, runValidators: true, session } 
    )
      .populate("user", "name email phone address")
      .populate("tour", "title costFrom")
      .populate("payment");

      // destructure users' info for ssl payload 🔦
      const userAddress = (updatedBooking?.user as any).address
      const userEmail = (updatedBooking?.user as any).email
      const userPhone = (updatedBooking?.user as any).phone
      const userName = (updatedBooking?.user as any).name
      
      // create ssl payload
      const sslPayload : ISSLCommerz = {
        address : userAddress,
        email: userEmail,
        phoneNumber: userPhone,
        name: userName,
        amount : amount,
        transactionId: transactionId
      }

      // pass ssl payload in ssl payment initialize function
      const sslPayment = await SSlService.sslPaymentInit(sslPayload)

      console.log(sslPayment);
      await session.commitTransaction() 
      session.endSession()

    // return updatedBooking; ❌before

    return {
      // payment: sslPayment,
      paymentUrl: sslPayment.GatewayPageURL,
      booking: updatedBooking
    }


  } catch (error) {
    await session.abortTransaction() 
    session.endSession()
    throw error 
  }
};

const getUserBookings = async (
  query: Record<string, string>,
  userId: string
) => {
  const queryElement = new QueryBuilder(Booking.find({ user: userId }), query);

  const bookings = queryElement.filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([
    bookings.build(),
    queryElement.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getBookingById = async (_id: string) => {
  const singleBooking = await Booking.findById(_id);

  return {
    data: singleBooking,
  };
};


const updateBookingStatus = async (_id: string, payload: Partial<IBooking>) => {
  const isBookingExist = await Booking.findById(_id);

  if (!isBookingExist) {
    throw new AppError(400, "No Booking exist to update.");
  }

  const updatedBooking = await Booking.findByIdAndUpdate(_id, payload, {
    new: true,
    runValidators: true,
  });

  return {
    data: updatedBooking,
  };
};

const getAllBookings = async (query: Record<string, string>) => {
  const queryElement = new QueryBuilder(Booking.find(), query);

  const bookings = queryElement.filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([
    bookings.build(),
    queryElement.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};


export const BookingService = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  getAllBookings,
};
