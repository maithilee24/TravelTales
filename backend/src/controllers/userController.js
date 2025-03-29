import asyncHandler from 'express-async-handler';
import User from "../../models/auth/userModel.js";
import generateToken from '../../helpers/generateToken.js';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import Token from '../../models/auth/Token.js';
import crypto from "node:crypto";
import hashToken from '../../helpers/hashToken.js';
import sendEmail from '../../helpers/sendEmail.js';
import nodemailer from "nodemailer";

export const registerUser = asyncHandler(async (req,res) => {
    const {name,email,password} = req.body;

    //validation
    if(!name || !email || !password){
        //400 bad request
        res.status(400).json({message: "All fields are required"});
    }

    //check password length
    if(password.length <6){
        return res.status(400).json({message: "Password must be at least 6 characters"});
    }

    //check if user already exists
    const userExists= await User.findOne({email});
    if(userExists){
        return res.status(400).json({message: "User already exists"});
    }
    //create user
    const user = await User.create({
        name,
        email,
        password,
    });

    //generate token
    const token = generateToken(user._id);
    
    //send back the user data and token
    res.cookie("token",token, {
        path: "/",
        httpOnly: true,
        maxAge: 30*24*60*60*1000,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    });  

    if(user){
        const {_id,name,email,role,photo,bio,isVerified} = user;
        res.status(201).json({
            _id,
            name,
            email,
            role,
            photo,
            bio,
            isVerified,
            token,
        });
    }
    else{
        res.status(400).json({message: "Invalid user data"});
    }
});

//user log in
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (!userExists) {
        return res.status(404).json({ message: "User not found, sign up!" });
    }

    // Debugging Logs
    console.log("Stored Hashed Password:", userExists.password);
    console.log("Entered Password:", password);

    // Compare password
    const isMatch = await bcrypt.compare(String(password), String(userExists.password));


    console.log("Password Match Result:", isMatch);

    if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
    }

    // Generate token
    const token = generateToken(userExists._id);

    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
        _id: userExists._id,
        name: userExists.name,
        email: userExists.email,
        role: userExists.role,
        photo: userExists.photo,
        bio: userExists.bio,
        isVerified: userExists.isVerified,
        token,
    });
});



//Logout user
export const logoutUser = asyncHandler(async (req,res) =>{
    res.clearCookie("token");
    res.status(200).json({message:"User logged Out"});
});

//get user
export const getUser = asyncHandler(async (req,res) => {
    // get user details from the token -----> exclude password
    const user=await User.findById(req.user._id).select("-password");
    if(user){
        res.status(200).json(user);
    }
    else{
        res.status(404).json({message: "User not found"});
    }
});

//update user
export const updateUser = asyncHandler(async (req,res) => {
    //get user details from the token ---> protect middleware
    const user = await User.findById(req.user._id);
    if(user){
        const {name,bio,role} = req.body;
        user.name= req.body.name || user.name;
        user.bio= req.body.bio || user.bio;
        user.photo= req.body.photo || user.photo;
        user.role = req.body.role || user.role;

        const upadated = await user.save();
        res.status(200).json({
            _id: upadated._id,
            name: upadated.name,
            email:upadated.email,
            role:upadated.role,
            photo:upadated.photo,
            bio:upadated.bio,
            isVerified:upadated.isVerified,
        });
    }
    else{
        res.status(404).json({message: "User not found"});
    }
});

//login status
export const userLoginStatus = asyncHandler(async (req,res) => {
     const token = req.cookies.token;
     if(!token){
        //unauthorised
        res.status(401).json({message: "Not authorized,please login!"});
     }
     //verify the token
     const decoded=jwt.verify(token,process.env.JWT_SECRET);
     if(decoded){
        res.status(200).json(true);
     }
     else{
        res.status(401).json(false);
     }
});

//email verification
export const verifyEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
        return res.status(400).json({ message: "User is already verified" });
    }

    let token = await Token.findOne({ userId: user._id });

    if (token) {
        await token.deleteOne();
    }

    const verificationToken = crypto.randomBytes(64).toString("hex") + user._id;
    const hashedToken = await hashToken(verificationToken);

    await new Token({
        userId: user._id,
        verificationToken: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }).save();

    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${encodeURIComponent(verificationToken)}`;

    const subject = "Email Verification - AuthKit";
    const send_to = user.email;
    const reply_to = "noreply@gmail.com";
    const template = "emailVerification";
    const send_from = process.env.USER_EMAIL;
    const name = user.name;
    const link = verificationLink;

    try {
        await sendEmail(subject, send_to, send_from, reply_to, template, name, link);
        return res.status(200).json({ message: "Verification email sent successfully" });
    } catch (error) {
        console.error("Error sending email: ", error);
        return res.status(500).json({ message: "Email could not be sent. Please try again later." });
    }
});

//verify user
export const verifyUser = asyncHandler(async (req,res) => {
    const {verificationToken} = req.params;

    if(!verificationToken){
        return res.status(400).json({message: "Invalid verification token"});
    }
    //hash the verification token --> because it was hashed before saving
    const hashedToken = hashToken(verificationToken);
    //find the user with the verification token
    const userToken= await Token.findOne({verificationToken: hashedToken,
        //check if the token has not expired
        expiresAt: { $gt: Date.now()},
    });
    if(!userToken){
        return res.status(400).json({message: "Invalid or expired verification token"});
    }

    //find user with the user id in the token
    const user= await User.findById(userToken.userId);

    if(user.isVerified){
        return res.status(400).json({message: "User is already verified"});
    }

    //update the user to verified
    user.isVerified=true;
    await user.save();
    res.status(200).json({message: "User verified"});
});


//forgot password
// export const forgotPassword = asyncHandler(async(req,res) => {
//     const {email} = req.body;
//     if(!email){
//         return res.status(400).json({message: "Email is required"});
//     }

//     //check if user exists
//     const user = await User.findOne({email});
//     if(!user){
//         return res.status(404).json({message: "User not found"});
//     }

//     //see if reset token exists
//     let token = await Token.findOne({userId: user._id});

//     //if token exists --> delete the token
//     if(token){
//         await token.deleteOne();
//     }

//     //create a reset token using the user id ---> expires in 1 hour
//     const passwordResetToken = crypto.randomBytes(64).toString("hex")+user._id;
//     //hash the reset token
//     const hashedToken = hashToken(passwordResetToken);

//     await new Token({
//         userId: user._id,
//         passwordResetToken: hashedToken,
//         createdAt: Date.now(),
//         expiresAt: Date.now()+60*60*1000, // 1 hour
//     }).save();

//     //reset link
//     const resetLink = `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}`;

//     //send email to user
//     const subject = "Password Reset - AuthKit";
//     const send_to = user.email;
//     const send_from = process.env.USER_EMAIL;
//     const reply_to = "noreply@noreply.com";
//     const template = "forgotPassword";
//     const name = user.name;
//     const url = resetLink;

//     try{
//         await sendEmail(subject,send_to,send_from,reply_to,template,name,url);
//         res.json({message: "Email sent"});
//     }
//     catch(error){
//         return res.status(500).json({message: "Email could not be sent" });
//     }
// });

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Delete existing reset token if it exists
    await Token.deleteOne({ userId: user._id });

    // Create a reset token using the user id (expires in 1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(resetToken); // Hash the token before storing

    await new Token({
        userId: user._id,
        passwordResetToken: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour expiration
    }).save();

    // Reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.USER_EMAIL, 
            pass: process.env.USER_PASSWORD, 
        },
    });

    const mailOptions = {
        from: process.env.USER_EMAIL,
        to: user.email,
        subject: "Password Reset - AuthKit",
        text: `Hello ${user.name},\n\nYou requested a password reset. Click the link below to reset your password:\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nRegards,\nAuthKit Team`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "Password reset email sent successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Email could not be sent", error: error.message });
    }
});

// Reset Password Controller
// export const resetPassword = asyncHandler(async (req, res) => {
//     const { resetToken } = req.params;
//     const { password } = req.body;

//     if (!password) {
//         return res.status(400).json({ message: "Password is required" });
//     }

//     // Hash the received token
//     const hashedToken = hashToken(resetToken);

//     // Find the token in the database and ensure it has not expired
//     const userToken = await Token.findOne({
//         passwordResetToken: hashedToken,
//         expiresAt: { $gt: Date.now() },
//     });

//     if (!userToken) {
//         return res.status(400).json({ message: "Invalid or expired reset token" });
//     }

//     // Find user using token's userId
//     const user = await User.findById(userToken.userId);
//     if (!user) {
//         return res.status(404).json({ message: "User not found" });
//     }

//     // Hash the new password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     user.password = hashedPassword;
//     await user.save();

//     // Delete the token after successful password reset
//     await userToken.deleteOne();

//     res.status(200).json({ message: "Password reset successfully" });
// });
export const resetPassword = asyncHandler(async (req, res) => {
    try {
        console.log("Reset Password Request Received:", req.params, req.body);

        const { token } = req.params;
        const { email, password } = req.body;

        if (!token || !email || !password) {
            return res.status(400).json({ message: "Missing required fields!" });
        }

        // Hash the received token
        const hashedToken = hashToken(token);
        console.log("Hashed Token:", hashedToken);

        // Find the token in the database
        const userToken = await Token.findOne({
            passwordResetToken: hashedToken,
            expiresAt: { $gt: Date.now() },
        });

        if (!userToken) {
            return res.status(400).json({ message: "Invalid or expired reset token!" });
        }

        console.log("User Token Found:", userToken);

        // Find user
        const user = await User.findOne({ _id: userToken.userId, email });
        if (!user) {
            return res.status(404).json({ message: "User not found or email mismatch!" });
        }

        console.log("Old Password (Before Update):", user.password);

        // Hash new password only if it's not already hashed
        if (!password.startsWith("$2a$")) {
            user.password = await bcrypt.hash(password, 10);
        } else {
            user.password = password;
        }

        console.log("New Hashed Password (Before Saving):", user.password);

        // Save the new password (disable middleware validation)
        await user.save({ validateBeforeSave: false });

        console.log("Updated Password (After Saving):", user.password);

        // Delete the token after reset
        await userToken.deleteOne();

        res.status(200).json({ message: "Password reset successfully!" });
    } catch (error) {
        console.error("Reset Password Error (Backend):", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



//change password
export const changePassword = asyncHandler(async(req,res) => {
    const {currentPassword,newPassword} = req.body;
    if(!currentPassword || !newPassword){
        return res.status(400).json({message: "All fields are required"});
    }
    //find user by id
    const user = await User.findById(req.user._id);

    //compare current password with the hashed password in the database
    const isMatch = await bcrypt.compare(currentPassword,user.password);
    if(!isMatch){
        return res.status(400).json({message: "Inavlid password!"});
    }
    //reset password
    if(isMatch){
        user.password=newPassword;
        await user.save();
        return res.status(200).json({message: "Password changed successfully"});
    }
    else{
        return res.status(400).json({message: "Password could not be changed!"});
    }
});