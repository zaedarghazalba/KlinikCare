import { prisma } from "@/lib/db";
import { headers } from "next/headers";

interface AuditLogParams {
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
}

export async function createAuditLog(params: AuditLogParams) {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined;
    const userAgent = headersList.get("user-agent") || undefined;

    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
