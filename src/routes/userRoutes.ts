import { Router } from "express";
import { register } from "../controllers/userController";

const router: Router = Router();

router.post("/register", register);

export default router;
