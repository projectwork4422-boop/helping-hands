import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        if (credentials.role === "ADMIN") {
          if (credentials.email === "admin@helpinghands.com" && credentials.password === "password123") {
            return {
              id: "admin-id-123",
              email: "admin@helpinghands.com",
              name: "Admin",
              role: "ADMIN",
            };
          }
          throw new Error("Invalid admin credentials");
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
            role: credentials.role as any,
          },
          include: {
            employeeProfile: true,
          }
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        if (user.role === "EMPLOYEE") {
          if (!user.employeeProfile) {
            throw new Error("Employee profile is missing.");
          }
          if (user.employeeProfile.status === "PENDING") {
            throw new Error("Your account is pending admin approval.");
          }
          if (user.employeeProfile.status === "REJECTED") {
            throw new Error("Your account has been rejected.");
          }
          if (user.employeeProfile.status === "SUSPENDED") {
            throw new Error("Your account has been suspended by the admin.");
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
