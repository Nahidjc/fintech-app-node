import { Router } from "express";
import { createCashoutPayment } from "../controllers/payment";

const router: Router = Router();

router.post("/payment/cashout", createCashoutPayment);

export default router;
