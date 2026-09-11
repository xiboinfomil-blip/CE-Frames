import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { userHelpers } from "@/lib/db-helpers";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        try {
          const user = await userHelpers.findByEmail(email);
          
          // If user not found or no password hash exists (e.g. OAuth users)
          if (!user || !user.passwordHash) return null;

          const isValidPassword = await bcrypt.compare(password, user.passwordHash);
          if (!isValidPassword) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.username,
            username: user.username,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.iat = Math.floor(Date.now() / 1000);  // Track when issued
      } else if (token.id && token.iat && (Math.floor(Date.now() / 1000) - (token.iat as number)) > 3600) {
        // Only refresh from DB after 1 hour to reduce unnecessary queries
        const currentUser = await userHelpers.findById(token.id as string);
        if (currentUser) {
          token.username = currentUser.username;
          token.role = currentUser.role;
          token.iat = Math.floor(Date.now() / 1000);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};

// Initialize NextAuth with the options
export default NextAuth(authOptions);