import express from "express";
import {adminMiddleware,protect,creatorMiddleware } from "../middleware/authMiddleware.js";
import {getUser,loginUser,logoutUser,registerUser,updateUser,userLoginStatus,verifyEmail,verifyUser,forgotPassword,resetPassword,changePassword} from "../controllers/auth/userController.js";
import { deleteUser,getAllUsers } from "../controllers/auth/adminController.js";

const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/logout",logoutUser);
//protect is middleware
router.get("/user",protect,getUser);
//update the user
router.patch("/user",protect,updateUser);

//admin route
router.delete("/admin/users/:id",protect,adminMiddleware,deleteUser);

//get all users
router.get("/users",protect,creatorMiddleware,getAllUsers);

//login status
router.get("/login-status",userLoginStatus);

//verify user -->email verification
router.post("/verify-email",protect,verifyEmail);

//verify-email --> email verification
router.post("/verify-user/:verificationToken",verifyUser);

//forgot password
router.post("/forgot-password", forgotPassword);

//reset password
router.post("/reset-password/:token",resetPassword);

//update/change password
router.patch("/change-password",protect,changePassword);

export default router;