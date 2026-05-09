import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Providers } from "@/components/providers";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

const VALID_ROLES = ["PATIENT", "ADMIN", "DOCTOR", "OWNER", "PHARMACY"];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  
  if (!VALID_ROLES.includes(role)) {
    redirect("/");
  }

  const roleHomepage: Record<string, string> = {
    PATIENT: "/patient",
    ADMIN: "/admin",
    DOCTOR: "/doctor",
    OWNER: "/owner",
    PHARMACY: "/pharmacy",
  };

  const correctHome = roleHomepage[role];
  const pathname = session.user.name || "";

  return (
    <Providers>
      <LayoutWrapper
        role={role}
        userName={session.user.name || "User"}
      >
        {children}
      </LayoutWrapper>
    </Providers>
  );
}