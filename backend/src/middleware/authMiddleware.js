import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/auth/userModel.js";
import Experience from "../models/auth/experienceModel.js";
export const protect = asyncHandler(async (req,res,next) => {
    try{
        const token=req.cookies.token;
        if(!token){
            res.status(401).json({message: "Not authorized,please login!"});
        }
        //verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //get user details from the token exclude password
        const user = await User.findById(decoded.id).select("-password");

        if(!user){
            res.status(404).json({message: "User not found" });
        }
        //set user details in the request object
        req.user=user;
        next();
    }
    catch(error){
        res.status(401).json({message: "Not authorized,token failed"});
    }
});

//admin middleware
export const adminMiddleware = asyncHandler(async (req,res,next) => {
    if(req.user && req.user.role ==="admin"){
        //if user is admin,move to the next middleware/controller
        next();
        return;
    }
    // if not admin,send 403 forbidden --> terminate the request
    res.status(403).json({message: "Only admins can do this!"});
});

export const creatorMiddleware = asyncHandler(async (req,res,next) => {
    if((req.user && req.user.role==="creator") || (req.user && req.user.role==="admin")){
        next();
        return;
    }
    res.status(403).json({message: "Only creators can do this!" });
});

//verified middleware
export const verifiedMiddleware = asyncHandler(async (req,res,next) => {
    if(req.user && req.user.isVerified ){
        next();
        return;
    }
    res.status(403).json({message: "Please verify your email address!"});
});

export const authorizeExperienceOwner = async (req, res, next) => {
    try {
      const experience = await Experience.findById(req.params.id);
      
      if (!experience) {
        return res.status(404).json({ message: "Experience not found" });
      }
  
      // Check if the logged-in user is the owner of the experience
      if (experience.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to modify this experience" });
      }
  
      next();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };