import { Router } from "express";
import { register, login, updateProfile, getUserbyId  } from "../controllers/userController";
import multer, { Multer } from "multer";
const upload: Multer = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

const router: Router = Router();

router.post("/register", register);
router.post("/profile/update/:id", upload.single("image"), updateProfile);
router.post("/login", login);
router.get("/user/:id", getUserbyId);

export default router;
