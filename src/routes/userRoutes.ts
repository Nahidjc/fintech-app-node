import { Router } from "express";
import { signup } from "../controllers/userController";

const router: Router = Router();

router.post("/register", signup);

export default router;
