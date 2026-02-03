"use client";
import React, { useState } from "react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/neon-button"; // Use our fancy new button

export const FloatingNav = ({
    navItems,
    className,
}: {
    navItems: {
        name: string;
        link: string;
        icon?: React.ReactNode;
    }[];
    className?: string;
}) => {
    const { scrollYProgress } = useScroll();
    const { user, logout } = useAuth();
    const [visible, setVisible] = useState(true);

    useMotionValueEvent(scrollYProgress, "change", (current) => {
        // Check if current is not undefined and is a number
        if (typeof current === "number") {
            let direction = current! - scrollYProgress.getPrevious()!;

            if (scrollYProgress.get() < 0.05) {
                setVisible(true);
            } else {
                if (direction < 0) {
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            }
        }
    });

    // Filter public items from props, or just use props as "base" items
    // We will append Auth items if user is logged in
    const displayNavItems = [...navItems];
    if (user) {
        displayNavItems.push(
            { name: "Profile", link: "/profile" }
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{
                    opacity: 1,
                    y: -100,
                }}
                animate={{
                    y: visible ? 0 : -100,
                    opacity: visible ? 1 : 0,
                }}
                transition={{
                    duration: 0.2,
                }}
                className={cn(
                    "flex max-w-fit fixed top-3 sm:top-6 inset-x-0 mx-auto border border-white/10 rounded-full bg-black/50 backdrop-blur-md shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-6 py-1.5 sm:py-2 items-center justify-center gap-6",
                    className
                )}
            >
                {displayNavItems.map((navItem: any, idx: number) => (
                    <Link
                        key={`link=${idx}`}
                        href={navItem.link}
                        className="px-4 py-1.5 text-sm font-medium text-text-secondary hover:text-white transition-all whitespace-nowrap rounded-full hover:bg-white/5"
                    >
                        <span className="block sm:hidden">{navItem.icon}</span>
                        <span className="hidden sm:block">{navItem.name}</span>
                    </Link>
                ))}

                {user ? (
                    <button
                        onClick={logout}
                        className="px-4 py-1.5 text-sm font-medium text-text-secondary hover:text-white transition-all whitespace-nowrap rounded-full hover:bg-white/5"
                    >
                        Logout
                    </button>
                ) : (
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Link href="/login">
                            <Button className="text-[10px] sm:text-xs px-2 sm:px-3 md:px-5 py-1.5 sm:py-2 h-auto" neon={true} variant="ghost">
                                Login
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button className="text-[10px] sm:text-xs px-2 sm:px-3 md:px-5 py-1.5 sm:py-2 h-auto" neon={true}>
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                )}

            </motion.div>
        </AnimatePresence>
    );
};
