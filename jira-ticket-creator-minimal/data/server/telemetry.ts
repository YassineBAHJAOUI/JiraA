import * as prometheus from 'prom-client';

/**
 * Configuration OpenTelemetry & Prometheus
 * Expose les métriques sur /metrics
 */

// Métriques personnalisées
export const metrics = {
  // Compteur des tickets créés
  ticketsCreated: new prometheus.Counter({
    name: 'jira_tickets_created_total',
    help: 'Nombre total de tickets Jira créés',
    labelNames: ['technology', 'environment', 'status'],
  }),

  // Histogramme du temps de création
  ticketCreationDuration: new prometheus.Histogram({
    name: 'jira_ticket_creation_duration_seconds',
    help: 'Durée de création d\'un ticket Jira en secondes',
    labelNames: ['technology', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
  }),

  // Compteur des erreurs Jira
  jiraErrors: new prometheus.Counter({
    name: 'jira_errors_total',
    help: 'Nombre total d\'erreurs lors de la création de tickets Jira',
    labelNames: ['error_type', 'technology'],
  }),

  // Gauge du nombre de tickets en attente
  ticketsPending: new prometheus.Gauge({
    name: 'jira_tickets_pending',
    help: 'Nombre de tickets en attente de traitement',
  }),

  // Compteur des requêtes API
  apiRequests: new prometheus.Counter({
    name: 'api_requests_total',
    help: 'Nombre total de requêtes API',
    labelNames: ['method', 'endpoint', 'status_code'],
  }),

  // Histogramme de la durée des requêtes
  apiRequestDuration: new prometheus.Histogram({
    name: 'api_request_duration_seconds',
    help: 'Durée des requêtes API en secondes',
    labelNames: ['method', 'endpoint'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  }),

  // Gauge de la taille de la base de données
  databaseConnections: new prometheus.Gauge({
    name: 'database_connections',
    help: 'Nombre de connexions actives à la base de données',
  }),

  // Compteur des validations échouées
  validationErrors: new prometheus.Counter({
    name: 'validation_errors_total',
    help: 'Nombre total d\'erreurs de validation',
    labelNames: ['field', 'error_type'],
  }),
};

/**
 * Initialiser les métriques par défaut
 */
export function initializeMetrics(): void {
  // Enregistrer les métriques par défaut de Prometheus
  prometheus.collectDefaultMetrics({
    prefix: 'nodejs_',
  });

  console.log('[Telemetry] Métriques Prometheus initialisées');
}

/**
 * Récupérer toutes les métriques au format Prometheus
 */
export async function getMetrics(): Promise<string> {
  return await prometheus.register.metrics();
}

/**
 * Réinitialiser le registre (utile pour les tests)
 */
export function resetMetrics(): void {
  prometheus.register.resetMetrics();
}

/**
 * Middleware pour tracker les requêtes API
 */
export function metricsMiddleware(req: any, res: any, next: any): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const method = req.method;
    const endpoint = req.route?.path || req.path || 'unknown';
    const statusCode = res.statusCode;

    // Incrémenter le compteur des requêtes
    metrics.apiRequests.inc({
      method,
      endpoint,
      status_code: statusCode,
    });

    // Enregistrer la durée
    metrics.apiRequestDuration.observe(
      { method, endpoint },
      duration
    );
  });

  next();
}

/**
 * Tracker la création d'un ticket
 */
export function trackTicketCreation(
  technology: string,
  environment: string,
  success: boolean,
  duration: number
): void {
  const status = success ? 'success' : 'failure';

  metrics.ticketsCreated.inc({
    technology,
    environment,
    status,
  });

  metrics.ticketCreationDuration.observe(
    { technology, status },
    duration / 1000
  );
}

/**
 * Tracker une erreur Jira
 */
export function trackJiraError(errorType: string, technology: string): void {
  metrics.jiraErrors.inc({
    error_type: errorType,
    technology,
  });
}

/**
 * Tracker une erreur de validation
 */
export function trackValidationError(field: string, errorType: string): void {
  metrics.validationErrors.inc({
    field,
    error_type: errorType,
  });
}

/**
 * Mettre à jour le nombre de tickets en attente
 */
export function updatePendingTickets(count: number): void {
  metrics.ticketsPending.set(count);
}

/**
 * Mettre à jour le nombre de connexions à la base de données
 */
export function updateDatabaseConnections(count: number): void {
  metrics.databaseConnections.set(count);
}
