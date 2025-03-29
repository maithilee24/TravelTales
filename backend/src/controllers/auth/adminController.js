import asyncHandler from "express-async-handler";
import User from "../../models/auth/userModel.js";
export const deleteUser = asyncHandler(async(req,res) => {
    const {id} = req.params;

    //attempt to find and delete the user
    const user = await User.findByIdAndDelete(id);

    //check if user exists
    if(!user){
        res.status(404).json({message: "User not found!"});
    }
    //delete user
    res.status(200).json({message: "User deleted successfully!"});
});

export const getAllUsers = asyncHandler(async(req,res) =>{
    const users = await User.find({});
    try{
        if(!users){
            res.status(404).json({message: "No users found!"});
        }
        res.status(200).json(users);
    }
    catch(error){
        res.status(500).json({message: "Cannot get users"});
    }
});