import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "PATIENT" | "ADMIN" | "DOCTOR" | "OWNER" | "PHARMACY";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "PATIENT" | "ADMIN" | "DOCTOR" | "OWNER" | "PHARMACY";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "PATIENT" | "ADMIN" | "DOCTOR" | "OWNER" | "PHARMACY";
  }
}
