import { Router } from "express";
import { createCashoutPayment, createSendMoneyPayment, expensesController, getUserTransactions } from "../controllers/payment";

const router: Router = Router();

router.post("/payment/cashout", createCashoutPayment);
router.post("/payment/sendmoney", createSendMoneyPayment);
router.get("/today/expense", expensesController);
router.get("/transactions", getUserTransactions);

export default router;
