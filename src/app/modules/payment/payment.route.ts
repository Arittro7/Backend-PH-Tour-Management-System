import  express  from 'express';
import { PaymentController } from './payment.controller';

const router = express.Router()

router.post("/success", PaymentController.successPayment)
router.post("/init-payment/:bookingId", PaymentController.initPayment)
router.post("/fail", PaymentController.failPayment)
router.post("/cancel", PaymentController.cancelPayment)
router.get("/invoice/:paymentId", PaymentController.getInvoiceDownloadUrl);

// todo: add auth checking for invoice route

export const PaymentRoutes = router