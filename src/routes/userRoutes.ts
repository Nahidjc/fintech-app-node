import { Router } from "express";
import { register } from "../controllers/userController";
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })
const router: Router = Router();

router.post("/register", upload.single('image'), register);

export default router;
