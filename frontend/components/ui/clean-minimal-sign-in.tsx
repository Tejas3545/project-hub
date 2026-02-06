"use client"

import * as React from "react"
import { useState } from "react";
import { LogIn, Lock, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

const CleanAuthForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const title = "Sign in with email";
    const subtitle = "Access is managed by admins. Use the credentials provided to you.";
    const buttonText = "Sign In";

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async () => {
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setIsLoading(true);

        try {
            await login(email, password);
            router.push("/dashboard");
        } catch (err: unknown) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#030303] p-4">
            {/* Glow Effect Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative w-full max-w-sm bg-[#0A0A0A] rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-white/10 text-white z-10">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-6 shadow-lg">
                    <LogIn className="w-7 h-7 text-white" />
                </div>

                <h2 className="text-2xl font-semibold mb-2 text-center text-white">
                    {title}
                </h2>
                <p className="text-gray-400 text-sm mb-6 text-center">
                    {subtitle}
                </p>

                <div className="w-full flex flex-col gap-3 mb-4">

                    <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
                            <Mail className="w-5 h-5" />
                        </span>
                        <input
                            placeholder="Email"
                            type="email"
                            value={email}
                            className="w-full pl-14 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-[#0F0F0F] text-white text-sm placeholder:text-gray-500 transition-all font-medium"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
                            <Lock className="w-5 h-5" />
                        </span>
                        <input
                            placeholder="Password"
                            type="password"
                            value={password}
                            className="w-full pl-14 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-[#0F0F0F] text-white text-sm placeholder:text-gray-500 transition-all font-medium"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="w-full flex justify-end">
                        {error && (
                            <div className="text-xs text-red-500 text-left w-full mr-auto font-medium">{error}</div>
                        )}
                        <button className="text-xs text-gray-400 hover:text-white transition-colors font-medium">
                            Forgot password?
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer transition-all mb-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Processing..." : buttonText}
                </button>

                <div className="flex items-center w-full my-2">
                    <div className="flex-grow border-t border-dashed border-white/10"></div>
                    <span className="mx-2 text-xs text-gray-500">Or continue with</span>
                    <div className="flex-grow border-t border-dashed border-white/10"></div>
                </div>

                <div className="flex gap-3 w-full justify-center mt-2">
                    {/* Social Buttons - Dark Mode */}
                    <button
                        className="flex items-center justify-center w-12 h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition grow"
                        aria-label="Continue with Google"
                        title="Continue with Google"
                    >
                        <Image
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            width={20}
                            height={20}
                            className="opacity-80 hover:opacity-100"
                        />
                    </button>
                    <button
                        className="flex items-center justify-center w-12 h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition grow"
                        aria-label="Continue with GitHub"
                        title="Continue with GitHub"
                    >
                        {/* Using a white github icon or generic icon since the provided one was facebook */}
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button
                        className="flex items-center justify-center w-12 h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition grow"
                        aria-label="Continue with Facebook"
                        title="Continue with Facebook"
                    >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" /></svg>
                    </button>
                </div>

                {/* Footer Link */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    Need access? Contact your administrator for credentials.
                </div>
            </div>
        </div>
    );
};

export { CleanAuthForm };
