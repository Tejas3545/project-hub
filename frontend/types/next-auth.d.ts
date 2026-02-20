import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      role?: string;
      isVerified?: boolean;
      firstName?: string | null;
      lastName?: string | null;
      bio?: string | null;
      profileImage?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: string;
    isVerified?: boolean;
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
    profileImage?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id: string;
    sub?: string;
    email?: string;
  }
}
