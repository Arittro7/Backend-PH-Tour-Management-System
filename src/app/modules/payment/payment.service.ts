/* eslint-disable @typescript-eslint/no-explicit-any */

import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";

const successPayment = async(query: Record<string, string>) => {
  
  //🚩 Copy & Paste the function from createBooking and modify here [🚩- Changes]
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
      { new: true, runValidators: true, session } //🚩 
    )
      .populate("user", "name email phone address")
      .populate("tour", "title costFrom")
      .populate("payment");

      /**
       * 🚩 On updatedBooking
       *  Instead of booking[0]._id I will get the booking from updatedPayment?.booking
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

const failPayment = async() => {

}

const cancelPayment = async() => {

}

export const PaymentService ={
  successPayment,
  failPayment,
  cancelPayment
}