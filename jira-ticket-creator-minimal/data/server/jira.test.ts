import { describe, it, expect, beforeAll } from "vitest";
import axios from "axios";

/**
 * Test de validation de la connexion à l'API Jira
 * Vérifie que les identifiants Jira sont corrects
 */
describe("Jira API Connection", () => {
  let jiraDomain: string;
  let jiraEmail: string;
  let jiraToken: string;
  let jiraProjectKey: string;

  beforeAll(() => {
    jiraDomain = process.env.JIRA_DOMAIN || "";
    jiraEmail = process.env.JIRA_EMAIL || "";
    jiraToken = process.env.JIRA_API_TOKEN || "";
    jiraProjectKey = process.env.JIRA_PROJECT_KEY || "";
  });

  it("should have all Jira environment variables configured", () => {
    expect(jiraDomain).toBeTruthy();
    expect(jiraEmail).toBeTruthy();
    expect(jiraToken).toBeTruthy();
    expect(jiraProjectKey).toBeTruthy();
  });

  it("should authenticate with Jira API using Basic Auth", async () => {
    if (!jiraDomain || !jiraEmail || !jiraToken) {
      console.log("Skipping Jira API test - credentials not configured");
      expect(true).toBe(true);
      return;
    }

    try {
      const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString("base64");

      const response = await axios.get(
        `https://${jiraDomain}/rest/api/2/myself`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("emailAddress");
      console.log(`✓ Jira API connection successful for ${response.data.emailAddress}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`✗ Jira API Error: ${error.response?.status} - ${error.response?.statusText}`);
        console.error(`Message: ${error.response?.data?.errorMessages?.[0] || error.message}`);
        throw new Error(`Jira API authentication failed: ${error.response?.status} ${error.response?.statusText}`);
      }
      throw error;
    }
  });

  it("should verify Jira project exists", async () => {
    if (!jiraDomain || !jiraEmail || !jiraToken || !jiraProjectKey) {
      console.log("Skipping Jira project test - credentials not configured");
      expect(true).toBe(true);
      return;
    }

    try {
      const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString("base64");

      const response = await axios.get(
        `https://${jiraDomain}/rest/api/2/project/${jiraProjectKey}`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("key");
      expect(response.data.key).toBe(jiraProjectKey);
      console.log(`✓ Jira project ${jiraProjectKey} exists and is accessible`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`✗ Jira Project Error: ${error.response?.status} - ${error.response?.statusText}`);
        console.error(`Message: ${error.response?.data?.errorMessages?.[0] || error.message}`);
        throw new Error(`Jira project ${jiraProjectKey} not found or not accessible: ${error.response?.status}`);
      }
      throw error;
    }
  });
});
