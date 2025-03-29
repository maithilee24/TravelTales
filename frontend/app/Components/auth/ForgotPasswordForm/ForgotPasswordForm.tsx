"use client";
import { useUserContext } from "@/context/userContext";
import React, { useState, useEffect } from "react";

function ForgotPasswordForm() {
    const { forgotPasswordEmail } = useUserContext();
    
    // State for email input
    const [email, setEmail] = useState("");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true); // Ensure it's rendered only on the client
    }, []);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) return; // Prevent submitting empty email
        forgotPasswordEmail(email);
        setEmail(""); // Clear input after submitting
    };

    // Render only on the client to prevent hydration issues
    if (!isClient) return null;

    return (
        <form onSubmit={handleSubmit} className="m-[2rem] px-10 py-14 rounded-lg bg-white max-w-[520px] w-full">
            <div className="relative z-10">
                <h1 className="mb-2 text-center text-[1.35rem] font-medium">
                    Enter email to reset password
                </h1>
                <div className="mt-[1rem] flex flex-col">
                    <label htmlFor="email" className="mb-1 text-[#999]">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        id="email"
                        name="email"
                        placeholder="johndoe@gmail.com"
                        className="px-4 py-3 border-[2px] rounded-md outline-[#2ECC71] text-gray-800"
                        required
                    />
                </div>
                <div className="flex">
                    <button
                        type="submit"
                        className="mt-[1.5rem] flex-1 px-4 py-3 font-bold bg-green-600 text-white rounded-md hover:bg-[#1abc9c] transition-colors"
                    >
                        Reset Password
                    </button>
                </div>
            </div>
        </form>
    );
}

export default ForgotPasswordForm;