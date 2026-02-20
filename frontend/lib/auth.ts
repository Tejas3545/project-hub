import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prismadb from "@/lib/prismadb"

import { sign } from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prismadb),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                console.log("----------------------------------------");
                console.log("Authorize Callback Reached");

                const email = credentials?.email;
                const password = credentials?.password;

                if (email === "admin@project.com" && password === "Admin@123") {
                    console.log("Admin credentials matched successfully!");
                    return {
                        id: "admin-user",
                        email: "admin@project.com",
                        name: "Admin User",
                        image: null,
                        role: "ADMIN",
                        isVerified: true
                    };
                }
                return null;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                // Pass the access token to the session
            // @ts-expect-error - NextAuth types don't include custom properties
            session.accessToken = token.accessToken;

            // Handle Admin Session
            if (token.email === "admin@project.com") {
                // @ts-expect-error - NextAuth types don't include custom properties
                session.user.id = "admin-user";
                // @ts-expect-error - NextAuth types don't include custom properties
                session.user.role = "ADMIN";
                // @ts-expect-error - NextAuth types don't include custom properties
                session.user.isVerified = true;
                return session;
            }

            if (token.sub) {
                // @ts-expect-error - NextAuth types don't include custom properties
                    try {
                        const user = await prismadb.user.findUnique({
                            where: { id: token.sub }
                        });

                        if (user) {
                            // @ts-expect-error - NextAuth types don't include custom properties
                            session.user.role = user.role
                            // @ts-expect-error - NextAuth types don't include custom properties
                            session.user.isVerified = user.isVerified
                            // @ts-expect-error - NextAuth types don't include custom properties
                            session.user.firstName = user.firstName
                            // @ts-expect-error - NextAuth types don't include custom properties
                            session.user.lastName = user.lastName
                            // @ts-expect-error - NextAuth types don't include custom properties
                            session.user.profileImage = user.profileImage || user.image
                            // @ts-expect-error - NextAuth types don't include custom properties
                            session.user.bio = user.bio
                        }
                    } catch (error) {
                        console.error("Error fetching user session data:", error);
                    }
                }
            }
            return session
        },
        async jwt({ token, user, account }) {
            // Initial sign in
            if (user) {
                token.sub = user.id;

                // Generate Backend-Compatible JWT
                // This token is signed with the SAME secret as the backend uses
                const backendJwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
                if (backendJwtSecret) {
                    const backendToken = sign(
                        {
                            id: user.id,
                            email: user.email,
                            role: (user as { role?: string }).role || 'STUDENT'
                        },
                        backendJwtSecret,
                        { expiresIn: '7d' }
                    );
                    token.accessToken = backendToken;
                }
            }
            return token
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
}
