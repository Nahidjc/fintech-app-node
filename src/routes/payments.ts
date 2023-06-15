import { Router } from "express";
import { createCashoutPayment, expensesController, getUserTransactions } from "../controllers/payment";

const router: Router = Router();

router.post("/payment/cashout", createCashoutPayment);
router.get("/today/expense", expensesController);
router.get("/transactions", getUserTransactions);

export default router;
