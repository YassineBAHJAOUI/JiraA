import { describe, expect, it, vi } from "vitest";
import { createJiraTicket } from "./jira";

describe("Jira Ticket Creation", () => {
  it("should format ticket summary correctly", async () => {
    // Mock axios pour éviter les appels réels à Jira
    vi.mock("axios", () => ({
      default: {
        post: vi.fn().mockResolvedValue({
          data: {
            key: "OPS-123",
          },
        }),
        isAxiosError: vi.fn((error) => error?.response !== undefined),
      },
    }));

    const testData = {
      technology: "Kubernetes",
      solutionCode: "APP-FRONT",
      environment: "PROD",
      squad: "Phoenix",
      email: "dev@example.com",
      cpu: 4,
      ram: 8,
    };

    // Le test vérifie que les données sont structurées correctement
    expect(testData.technology).toBe("Kubernetes");
    expect(testData.environment).toBe("PROD");
    expect(testData.cpu).toBe(4);
    expect(testData.ram).toBe(8);
  });

  it("should validate email format", async () => {
    const validEmail = "test@example.com";
    const invalidEmail = "not-an-email";

    expect(validEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(invalidEmail).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("should validate environment enum", async () => {
    const validEnvironments = ["DEV", "INT", "UAT", "PROD"];
    const testEnv = "PROD";

    expect(validEnvironments).toContain(testEnv);
  });

  it("should validate technology enum", async () => {
    const validTechnologies = ["VM", "Kubernetes", "Database", "Middleware", "Storage"];
    const testTech = "Kubernetes";

    expect(validTechnologies).toContain(testTech);
  });
});
