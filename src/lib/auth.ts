import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes session timeout
  },
  jwt: {
    maxAge: 30 * 60, // 30 minutes token timeout
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          throw new Error("Email tidak ditemukan");
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Password salah");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const u = user as { role?: string };
        (token as unknown as { role?: string }).role = u.role;
        (token as unknown as { lastActive?: number }).lastActive = Date.now();
      }
      const t = token as unknown as { lastActive?: number };
      if (t.lastActive && (Date.now() - t.lastActive) > 30 * 60 * 1000) {
        return {} as typeof token;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as unknown as { id?: string; role?: string };
      if (!t || !t.id) {
        return {} as typeof session;
      }
      if (session.user) {
        session.user.id = t.id;
        (session.user as unknown as { role?: string }).role = t.role;
      }
      return session;
    },
  },
});