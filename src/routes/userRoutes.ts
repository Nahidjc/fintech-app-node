import { Router } from "express";
import { register, login } from "../controllers/userController";
import multer, { Multer } from "multer";
const upload: Multer = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

const router: Router = Router();

router.post("/register", upload.single("image"), register);
router.post("/login", login);

export default router;
