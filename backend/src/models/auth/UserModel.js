import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Please provide your name"],
    },
    email: {
        type: String,
        required: [true,"Please an email"],
        unique: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please add a valid email"],
    },
    password:{
        type: String,
        required: [true,"Please add password!"],
    },
    photo: {
        type: String,
        default: "",
    },
    bio:{
        type: String,
        default: "I am a new user.",
    },
    role: {
        type: String,
        enum: ["user","admin","creator"],
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
},
{ timestamps:true,minimize:true}
);

//hash the password before saving
userSchema.pre("save", async function (next) {
    // Prevent hashing if the password is already hashed
    if (!this.isModified("password") || this.password.startsWith("$2a$")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User=mongoose.model("User",userSchema);

export default User;