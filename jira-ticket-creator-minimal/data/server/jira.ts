import axios from "axios";
import { ENV } from "./_core/env";

/**
 * Interface pour les données de création de ticket
 */
export interface CreateTicketData {
  technology: string;
  solutionCode: string;
  environment: string;
  squad: string;
  email: string;
  cpu?: number;
  ram?: number;
  dbEngine?: string;
  diskSize?: number;
  storageType?: string;
  storageQuota?: number;
}

/**
 * Réponse de création de ticket Jira
 */
export interface JiraTicketResponse {
  key: string;
  url: string;
}

/**
 * Créer un ticket Jira via l'API REST
 */
export async function createJiraTicket(data: CreateTicketData): Promise<JiraTicketResponse> {
  const jiraDomain = process.env.JIRA_DOMAIN;
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraToken = process.env.JIRA_API_TOKEN;
  const projectKey = process.env.JIRA_PROJECT_KEY;

  if (!jiraDomain || !jiraEmail || !jiraToken || !projectKey) {
    throw new Error("Jira configuration missing");
  }

  // Construire la description formatée
  const description = buildDescription(data);

  // Construire le payload Jira
  const payload = {
    fields: {
      project: { key: projectKey },
      summary: buildSummary(data),
      description: description,
      issuetype: { name: "Task" },
      priority: { name: getPriority(data.environment) },
      labels: buildLabels(data),
    },
  };

  try {
    // Authentification Basic Auth
    const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString("base64");

    const response = await axios.post(
      `https://${jiraDomain}/rest/api/2/issue`,
      payload,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    const ticketUrl = `https://${jiraDomain}/browse/${response.data.key}`;

    return {
      key: response.data.key,
      url: ticketUrl,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Jira API Error:", error.response?.data || error.message);
      throw new Error(`Jira API Error: ${error.response?.status} - ${error.response?.statusText}`);
    }
    throw error;
  }
}

/**
 * Construire le titre du ticket
 */
function buildSummary(data: CreateTicketData): string {
  return `[${data.technology}] ${data.solutionCode} - ${data.environment}`;
}

/**
 * Construire la description formatée en Jira Markup
 */
function buildDescription(data: CreateTicketData): string {
  let description = `*Demande Technique Automatisée*
---
*Informations Générales*
* Technologie : ${data.technology}
* Environnement : ${data.environment}
* Code Solution : ${data.solutionCode}
* Squad : ${data.squad}
* Demandeur : ${data.email}

`;

  // Ajouter les spécifications selon la technologie
  if ((data.technology === "VM" || data.technology === "Kubernetes") && data.cpu && data.ram) {
    description += `*Spécifications Compute*
* CPU : ${data.cpu} Cores
* RAM : ${data.ram} GB

`;
  }

  if (data.technology === "Database" && data.dbEngine && data.diskSize) {
    description += `*Spécifications Base de Données*
* Moteur : ${data.dbEngine}
* Taille Disque : ${data.diskSize} GB

`;
  }

  if (data.technology === "Storage" && data.storageType && data.storageQuota) {
    description += `*Spécifications Stockage*
* Type : ${data.storageType}
* Quota : ${data.storageQuota} GB

`;
  }

  // Ajouter les critères d'acceptation
  description += `*Critères d'Acceptation*
- [ ] Ressource provisionnée
- [ ] Configuration validée
- [ ] Accès accordés à la squad
- [ ] Monitoring configuré
- [ ] Documentation mise à jour`;

  return description;
}

/**
 * Construire les labels selon la technologie et l'environnement
 */
function buildLabels(data: CreateTicketData): string[] {
  const labels = [data.technology, data.environment, "AutoCreated"];
  return labels;
}

/**
 * Déterminer la priorité selon l'environnement
 */
function getPriority(environment: string): string {
  const priorityMap: Record<string, string> = {
    PROD: "High",
    UAT: "Medium",
    INT: "Medium",
    DEV: "Low",
  };
  return priorityMap[environment] || "Medium";
}
