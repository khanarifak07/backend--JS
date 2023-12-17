import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.moddleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    //we used upload middleware just before calling the registerUser function
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),

  registerUser
);

export default router;
