import { Router } from "express";
import { createCashoutPayment, expensesController } from "../controllers/payment";

const router: Router = Router();

router.post("/payment/cashout", createCashoutPayment);
router.get("/today/expense", expensesController);

export default router;
