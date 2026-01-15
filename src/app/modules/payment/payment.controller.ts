import  httpStatus  from 'http-status-codes';
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { envVars } from "../../config/env";
import { sendResponse } from "../../utils/sendResponse";

const successPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query
  const result = await PaymentService.successPayment(query as Record<string, string>)

  if(result.success){
    res.redirect(`${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
  }

  /**
   * I also want to send the status and amount to do so I'll update the success_url in sslCommerz.service.ts and use here. To get the value I will use query instead of payload
   * 
   * Now If I try to make payment for a booking I will get all those info on the url bar
   * 
   * http://localhost:5173/api/v1/payment/success?transactionId=tran_1754596091007_254&message=Payment%20Completed%20Successfully&amount=15000&status=success
   */
})

const initPayment = catchAsync(async (req: Request, res: Response) => {
  const bookingId = req.params.bookingId

  const result = await PaymentService.initPayment(bookingId as string)

  sendResponse(res, {
    success: true,
    statusCode : httpStatus.OK,
    message: "User Created Successfully",
    data: result
  })
})

const failPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query
  const result = await PaymentService.failPayment(query as Record<string, string>)

  if(!result.success){ //🚩 add ! to make it false & change redirect url
    res.redirect(`${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
  }
})

const cancelPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query
  const result = await PaymentService.cancelPayment(query as Record<string, string>)

  if(!result.success){ //🚩 add ! to make it false & change redirect url
    res.redirect(`${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
  }
})

const getInvoiceDownloadUrl = catchAsync(
    async (req: Request, res: Response) => {
        const { paymentId } = req.params;
        const result = await PaymentService.getInvoiceDownloadUrl(paymentId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Invoice download URL retrieved successfully",
            data: result,
        });
    }
);

export const PaymentController = {
  successPayment,
  failPayment,
  cancelPayment,
  initPayment,
  getInvoiceDownloadUrl
}