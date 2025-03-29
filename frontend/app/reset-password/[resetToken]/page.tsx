"use client"; // Ensures this runs only on the client

import { useUserContext } from "@/context/userContext";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ResetPasswordPage() {
    const { resetPassword } = useUserContext();
    const params = useParams();
    const resetToken = Array.isArray(params?.resetToken) ? params?.resetToken[0] : params?.resetToken;


    const [email, setEmail] = useState(""); // Added email state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    if (!resetToken) {
        return <p className="text-center mt-4">Loading...</p>;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email) {
            toast.error("Email is required!");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long!");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        try {
            await resetPassword(resetToken, email, password); // Sending email in request
            toast.success("Password reset successful!");
        } catch (error) {
            toast.error("Failed to reset password. Try again!");
        }
    };

    return (
        <main className="bg-[#082026] w-full min-h-screen flex justify-center items-center">
            <form onSubmit={handleSubmit} className="m-[2rem] px-10 py-14 rounded-lg bg-white max-w-[520px] w-full">
                <h1 className="mb-2 text-center text-[1.35rem] font-medium">Reset Your Password</h1>

                {/* Email Field */}
                <div className="relative mt-4 flex flex-col">
                    <label htmlFor="email" className="mb-1 text-[#999]">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        id="email"
                        placeholder="Enter your email"
                        className="px-4 py-3 border-[2px] rounded-md outline-[#2ECC71] text-gray-800"
                        required
                    />
                </div>

                {/* New Password Field */}
                <div className="relative mt-4 flex flex-col">
                    <label htmlFor="password" className="mb-1 text-[#999]">New Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        id="password"
                        placeholder="********"
                        className="px-4 py-3 border-[2px] rounded-md outline-[#2ECC71] text-gray-800"
                        required
                    />
                    <button
                        className="absolute p-1 right-4 top-[43%] text-[22px] text-[#999]"
                        onClick={() => setShowPassword((prev) => !prev)}
                        type="button"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                {/* Confirm Password Field */}
                <div className="relative mt-4 flex flex-col">
                    <label htmlFor="confirmPassword" className="mb-1 text-[#999]">Confirm Password</label>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        id="confirmPassword"
                        placeholder="********"
                        className="px-4 py-3 border-[2px] rounded-md outline-[#2ECC71] text-gray-800"
                        required
                    />
                    <button
                        className="absolute p-1 right-4 top-[43%] text-[22px] text-[#999]"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        type="button"
                    >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                <button type="submit" className="mt-6 w-full px-4 py-3 font-bold bg-green-600 text-white rounded-md hover:bg-[#1abc9c] transition-colors">
                    Reset Password
                </button>
            </form>
        </main>
    );
}

export default ResetPasswordPage;