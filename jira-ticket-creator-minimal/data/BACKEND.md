# Backend - Jira Ticket Creator

Guide complet du backend avec intégration OpenTelemetry et Prometheus.

## 📋 Vue d'ensemble

Le backend est construit avec :
- **Node.js + Express** - Serveur HTTP
- **tRPC** - Framework RPC type-safe
- **MySQL + Drizzle ORM** - Persistance des données
- **Axios** - Client HTTP pour l'API Jira
- **Prometheus** - Exposition des métriques
- **prom-client** - Client Prometheus pour Node.js

---

## 🏗️ Architecture

```
server/
├── _core/
│   ├── index.ts              # Point d'entrée du serveur
│   ├── context.ts            # Contexte tRPC
│   ├── trpc.ts               # Configuration tRPC
│   ├── oauth.ts              # Routes OAuth
│   ├── cookies.ts            # Gestion des cookies
│   ├── env.ts                # Variables d'environnement
│   └── vite.ts               # Intégration Vite
├── routers.ts                # Procédures tRPC
├── db.ts                     # Helpers base de données
├── jira.ts                   # Intégration API Jira
└── telemetry.ts              # Métriques Prometheus
```

---

## 🔌 Endpoints API

### Créer un ticket Jira

**Procédure tRPC :** `ticket.create`

```typescript
// Input
{
  technology: string;           // Ex: "Kubernetes", "Database"
  solutionCode: string;         // Ex: "S999"
  environment: string;          // Ex: "DEV", "PROD"
  squad: string;                // Ex: "Platform"
  email: string;                // Ex: "user@company.com"
  cpu?: number;                 // Pour VM/Kubernetes
  ram?: number;                 // Pour VM/Kubernetes
  dbEngine?: string;            // Pour Database
  diskSize?: number;            // Pour Database
  storageType?: string;         // Pour Storage
  storageQuota?: number;        // Pour Storage
}

// Output
{
  success: boolean;
  key: string;                  // Ex: "OPS-123"
  url: string;                  // URL du ticket Jira
}
```

### Créer plusieurs tickets Jira

**Procédure tRPC :** `ticket.createMultiple`

```typescript
// Input
{
  squad: string;
  email: string;
  technologies: Array<{
    technology: string;
    solutionCode: string;
    environment: string;
    cpu?: number;
    ram?: number;
    dbEngine?: string;
    diskSize?: number;
    storageType?: string;
    storageQuota?: number;
  }>
}

// Output
Array<{
  key: string;
  url: string;
}>
```

### Exposer les métriques Prometheus

**Endpoint HTTP :** `GET /metrics`

```bash
curl http://localhost:3000/metrics
```

Retourne les métriques au format Prometheus.

---

## 📊 Métriques Prometheus

### Métriques Disponibles

| Métrique | Type | Description |
|----------|------|-------------|
| `jira_tickets_created_total` | Counter | Nombre total de tickets créés |
| `jira_ticket_creation_duration_seconds` | Histogram | Durée de création d'un ticket |
| `jira_errors_total` | Counter | Nombre total d'erreurs Jira |
| `jira_tickets_pending` | Gauge | Nombre de tickets en attente |
| `api_requests_total` | Counter | Nombre total de requêtes API |
| `api_request_duration_seconds` | Histogram | Durée des requêtes API |
| `database_connections` | Gauge | Nombre de connexions DB |
| `validation_errors_total` | Counter | Nombre d'erreurs de validation |
| `nodejs_*` | Various | Métriques Node.js par défaut |

### Labels des Métriques

**jira_tickets_created_total**
- `technology` : Technologie du ticket
- `environment` : Environnement (DEV, INT, UAT, PROD)
- `status` : success ou failure

**jira_ticket_creation_duration_seconds**
- `technology` : Technologie du ticket
- `status` : success ou failure

**api_requests_total**
- `method` : HTTP method (GET, POST, etc.)
- `endpoint` : Endpoint API
- `status_code` : HTTP status code

### Exemples de Requêtes Prometheus

```promql
# Nombre de tickets créés avec succès
jira_tickets_created_total{status="success"}

# Durée moyenne de création par technologie
avg(rate(jira_ticket_creation_duration_seconds_sum[5m])) by (technology)

# Taux d'erreur Jira
rate(jira_errors_total[5m])

# Temps de réponse API
histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m]))
```

---

## 🔐 Variables d'Environnement Requises

Voir le fichier `VARIABLES.md` pour la liste complète.

**Variables obligatoires :**

```bash
# Base de données
DATABASE_URL=mysql://user:password@localhost:3306/jira_db

# Jira
JIRA_DOMAIN=instance.atlassian.net
JIRA_EMAIL=email@company.com
JIRA_API_TOKEN=your-token
JIRA_PROJECT_KEY=OPS

# Sécurité
JWT_SECRET=your-secret-key
```

**Variables optionnelles (Prometheus) :**

```bash
OTEL_ENABLED=true
OTEL_SERVICE_NAME=jira-ticket-creator
PROMETHEUS_PORT=9090
```

---

## 🚀 Démarrage du Serveur

### Mode Développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`
Les métriques sont disponibles sur `http://localhost:3000/metrics`

### Mode Production

```bash
npm run build
npm run start
```

---

## 📝 Création d'un Ticket Jira

### Flux Complet

1. **Frontend** envoie les données du formulaire
2. **tRPC Procedure** valide les données avec Zod
3. **jira.ts** construit le payload Jira
4. **API Jira REST** crée le ticket
5. **db.ts** sauvegarde en base de données
6. **telemetry.ts** enregistre les métriques
7. **Frontend** affiche le lien du ticket créé

### Exemple de Payload Jira

```json
{
  "fields": {
    "project": { "key": "OPS" },
    "summary": "[Kubernetes] S999 - DEV",
    "description": "*Demande Technique Automatisée*\n---\n*Informations Générales*\n* Technologie : Kubernetes\n* Environnement : DEV\n* Code Solution : S999\n* Squad : Platform\n* Demandeur : user@company.com\n\n*Spécifications Compute*\n* CPU : 4 Cores\n* RAM : 8 GB\n\n*Critères d'Acceptation*\n- [ ] Ressource provisionnée\n- [ ] Configuration validée\n- [ ] Accès accordés à la squad\n- [ ] Monitoring configuré\n- [ ] Documentation mise à jour",
    "issuetype": { "name": "Task" },
    "priority": { "name": "Low" },
    "labels": ["Kubernetes", "DEV", "AutoCreated"]
  }
}
```

---

## 🔍 Gestion des Erreurs

### Types d'Erreurs

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Jira configuration missing` | Variables d'env manquantes | Vérifier JIRA_DOMAIN, JIRA_EMAIL, etc. |
| `Jira API Error: 401` | Token API invalide | Régénérer le token Jira |
| `Jira API Error: 404` | Projet inexistant | Vérifier JIRA_PROJECT_KEY |
| `Database not available` | Connexion MySQL échouée | Vérifier DATABASE_URL |
| `Validation error` | Données invalides | Vérifier le format des données |

### Logging

Les erreurs sont loggées dans la console :

```
[Telemetry] Métriques Prometheus initialisées
Server running on http://localhost:3000/
Prometheus metrics available at http://localhost:3000/metrics
Error creating Jira ticket: Error: Jira API Error: 401 - Unauthorized
```

---

## 📊 Monitoring avec Prometheus

### Configuration Prometheus

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'jira-ticket-creator'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

### Dashboards Grafana

Exemples de panneaux :

1. **Tickets créés par technologie** (Counter)
2. **Durée moyenne de création** (Histogram)
3. **Taux d'erreur** (Counter)
4. **Requêtes API par endpoint** (Counter)
5. **Temps de réponse API** (Histogram)

---

## 🧪 Tests

### Exécuter les Tests

```bash
npm run test
```

### Tester Manuellement

```bash
# Créer un ticket via cURL
curl -X POST http://localhost:3000/api/trpc/ticket.create \
  -H "Content-Type: application/json" \
  -d '{
    "technology": "Kubernetes",
    "solutionCode": "S999",
    "environment": "DEV",
    "squad": "Platform",
    "email": "user@company.com",
    "cpu": 4,
    "ram": 8
  }'

# Consulter les métriques
curl http://localhost:3000/metrics | grep jira_tickets_created_total
```

---

## 🔗 Intégration Jira

### Authentification

L'authentification utilise **Basic Auth** :

```typescript
const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString("base64");
// Authorization: Basic <base64(email:token)>
```

### Endpoint API Jira

```
POST https://{JIRA_DOMAIN}/rest/api/2/issue
```

### Génération du Token Jira

1. Aller sur https://id.atlassian.com/manage-profile/security/api-tokens
2. Cliquer sur "Create API token"
3. Copier le token généré
4. Ajouter dans les variables d'environnement

---

## 📚 Fichiers Clés

| Fichier | Responsabilité |
|---------|-----------------|
| `server/jira.ts` | Intégration API Jira REST |
| `server/routers.ts` | Procédures tRPC |
| `server/db.ts` | Helpers base de données |
| `server/telemetry.ts` | Métriques Prometheus |
| `server/_core/index.ts` | Point d'entrée serveur |
| `drizzle/schema.ts` | Schéma base de données |

---

## 🚨 Troubleshooting

### Le serveur ne démarre pas

```bash
# Vérifier les variables d'env
echo $DATABASE_URL
echo $JIRA_DOMAIN

# Vérifier la connexion MySQL
mysql -u root -p -h localhost
```

### Les métriques ne s'affichent pas

```bash
# Vérifier l'endpoint
curl http://localhost:3000/metrics

# Vérifier les logs
npm run dev 2>&1 | grep -i "telemetry\|metrics"
```

### Erreur Jira 401

```bash
# Vérifier le token
curl -u email@company.com:YOUR_TOKEN https://instance.atlassian.net/rest/api/2/myself
```

---

## 📖 Documentation Supplémentaire

- [Jira REST API v2](https://developer.atlassian.com/cloud/jira/rest/v2/)
- [tRPC Documentation](https://trpc.io/)
- [Prometheus Metrics](https://prometheus.io/docs/concepts/data_model/)
- [Drizzle ORM](https://orm.drizzle.team/)
