import httpStatus  from 'http-status-codes';
/* eslint-disable @typescript-eslint/no-explicit-any */

import AppError from "../../errorHelpers/AppError";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";
import { ISSLCommerz } from '../SSLCommerz/sslCommerz.interface';
import { SSlService } from '../SSLCommerz/sslCommerz.service';

const initPayment = async(bookingId: string) =>{
  const payment = await Payment.findOne({booking: bookingId})

  if(!payment){
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found. You have not booked this tour")
  }

  const booking = await Booking.findById(payment.booking)
  
        const userAddress = (booking?.user as any).address
        const userEmail = (booking?.user as any).email
        const userPhone = (booking?.user as any).phone
        const userName = (booking?.user as any).name
        
        // create ssl payload
        const sslPayload : ISSLCommerz = { //❌ I forgot to import ISSL in createBooking in service
          address : userAddress,
          email: userEmail,
          phoneNumber: userPhone,
          name: userName,
          amount : payment.amount, //🚩 changed 
          transactionId: payment.transactionId //🚩 changed
        }
        const sslPayment = await SSlService.sslPaymentInit(sslPayload)
  // copied from booking.service (createBooking)

  return{
    paymentUrl : sslPayment.GatewayPageURL
  }
}

const successPayment = async(query: Record<string, string>) => {
  
  //🚩 Copy & Paste the function from createBooking(controller) and modify here [🚩- Changes]
  const session = await Booking.startSession(); //🚩- imp Booking
  session.startTransaction();

  try {
    //🚩 removed users' tour, amount, booking functionality 

    const UpdatedPayment = await Payment.findOneAndUpdate({transactionId:query.transactionId}, {
      status: PAYMENT_STATUS.PAID,
    },{ new: true, runValidators: true, session });
    
    /**
     * 🚩
     * change variable name to updatedPayment
     * Import the Payment and execute findOneAndUpdate operation
     * To get the specific Tour I will use the payment Transaction, coz it has all the necessary information. To get it I will pass transactionId: query.transactionId as 1st obj parameter.
     * I will pass a query parameter on the const successPayment = async(query: Record<string, string>) which will get the value from sslCommerz.service.ts where I need to update the success_url value as below
     * success_url: `${envVars.SSL.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}`, 
     * note: remove [] from the second parameter & remove everything except payment status & change it to PAID
     */

    await Booking.findByIdAndUpdate(
      UpdatedPayment?.booking,
      // { payment: payment[0]._id }, ❌❌❌
      {status: BOOKING_STATUS.COMPLETE}, //🚩
      {runValidators: true, session } //🚩 remove new true
    )

      /**
       * 🚩 On updatedBooking
       * Instead of booking[0]._id I will get the booking from updatedPayment?.booking
       * remove populates 
       */

      await session.commitTransaction() 
      session.endSession()

    return {
      success: true, message: "Payment Completed Successfully"
    }
  } catch (error) {
    await session.abortTransaction() 
    session.endSession()
    throw error 
  }
}

const failPayment = async(query: Record<string, string>) => {

  const session = await Booking.startSession(); 
  session.startTransaction();

  try {

    const UpdatedPayment = await Payment.findOneAndUpdate({transactionId:query.transactionId}, {
      status: PAYMENT_STATUS.FAILED,  //🚩 change the status to failed
    },{ new: true, runValidators: true, session });
    
    await Booking.findByIdAndUpdate(
      UpdatedPayment?.booking,
      {status: BOOKING_STATUS.FAILED}, //🚩Change the status to failed
      { runValidators: true, session }  //🚩remove new true
    )

      await session.commitTransaction() 
      session.endSession()

    return {
      success: false, message: "Payment Failed" //🚩Change the message
    }
  } catch (error) {
    await session.abortTransaction() 
    session.endSession()
    throw error 
  }
}

const cancelPayment = async(query: Record<string, string>) => {
  const session = await Booking.startSession(); 
  session.startTransaction();

  try {

    const UpdatedPayment = await Payment.findOneAndUpdate({transactionId:query.transactionId}, {
      status: PAYMENT_STATUS.CANCELLED, //🚩 change status to cancel
    },{ runValidators: true, session });
    
    await Booking.findByIdAndUpdate(
      UpdatedPayment?.booking,
      {status: BOOKING_STATUS.CANCEL}, //🚩 change status to cancel
      { runValidators: true, session } 
    )
      await session.commitTransaction() 
      session.endSession()

    return {
      success: false, message: "Payment Canceled"
    }
  } catch (error) {
    await session.abortTransaction() 
    session.endSession()
    throw error 
  }
}

export const PaymentService ={
  successPayment,
  failPayment,
  cancelPayment,
  initPayment
}