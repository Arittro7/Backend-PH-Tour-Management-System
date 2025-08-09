import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { envVars } from "../../config/env";

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

const failPayment = catchAsync(async (req: Request, res: Response) => {

})

const cancelPayment = catchAsync(async (req: Request, res: Response) => {

})

export const PaymentController = {
  successPayment,
  failPayment,
  cancelPayment
}