import { describe, it, expect, vi, beforeEach } from "vitest";

// Proper mock types
type MockAuth = ReturnType<typeof vi.fn> & {
  mockResolvedValue: (value: any) => void;
};

// Mock modules - must be at top level
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockReturnValue(Promise.resolve(null)),
}));

vi.mock("@/lib/rate-limit", () => ({
  apiRateLimit: vi.fn().mockResolvedValue(null),
  bookingRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    appointment: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({}),
    },
    patient: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    doctor: {
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
    },
  },
}));

vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,mock"),
  },
}));

// Import after mocks
import { GET, POST } from "../appointments/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

describe("Appointments API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/appointments", () => {
    it("should return 401 if no session", async () => {
      (auth as MockAuth).mockResolvedValue(null);

      const req = new Request("http://localhost:3000/api/appointments");
      const res = await GET(req);
      
      expect(res.status).toBe(401);
    });

    it("should return appointments for authenticated user", async () => {
      (auth as MockAuth).mockResolvedValue({
        user: { id: "user1", role: "ADMIN" },
      });

      vi.mocked(prisma.appointment.findMany).mockResolvedValue([
        { 
          id: "apt1", 
          queueNumber: 1, 
          status: "WAITING",
          createdAt: new Date(),
          updatedAt: new Date(),
          patientId: "patient1",
          doctorId: "doctor1",
          appointmentDate: new Date(),
          timeSlot: "10:00-10:30",
          qrCode: null,
          notes: null,
        },
      ]);

      const req = new Request("http://localhost:3000/api/appointments");
      const res = await GET(req);

      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/appointments", () => {
    it("should return 401 if no session", async () => {
      (auth as MockAuth).mockResolvedValue(null);

      const req = new Request("http://localhost:3000/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          patientId: "patient1",
          doctorId: "doctor1",
          appointmentDate: "2024-06-15T10:00:00.000Z",
          timeSlot: "10:00-10:30",
        }),
      });

      const res = await POST(req);

      expect(res.status).toBe(401);
    });
  });
});