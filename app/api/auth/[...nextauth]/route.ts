// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Import the options we just created

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };