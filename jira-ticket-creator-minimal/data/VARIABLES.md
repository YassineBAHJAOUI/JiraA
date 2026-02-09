# Variables d'Environnement - Jira Ticket Creator

Ce fichier documente toutes les variables d'environnement requises et optionnelles pour faire fonctionner l'application.

## 📋 Variables Requises (Obligatoires)

### Base de Données
```
DATABASE_URL=mysql://username:password@localhost:3306/jira_ticket_creator
```
- **Description** : Chaîne de connexion MySQL
- **Format** : `mysql://user:password@host:port/database`
- **Exemple** : `mysql://root:mypassword@localhost:3306/jira_db`

### Jira Configuration
```
JIRA_DOMAIN=your-instance.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token-here
JIRA_PROJECT_KEY=OPS
```

| Variable | Description | Exemple |
|----------|-------------|---------|
| `JIRA_DOMAIN` | Domaine Jira (sans https://) | `monentreprise.atlassian.net` |
| `JIRA_EMAIL` | Email du compte Jira | `tech@monentreprise.com` |
| `JIRA_API_TOKEN` | Token API Jira | Générer sur https://id.atlassian.com/manage-profile/security/api-tokens |
| `JIRA_PROJECT_KEY` | Clé du projet Jira | `OPS`, `INFRA`, `DEV` |

### Authentification
```
JWT_SECRET=your-jwt-secret-key-change-this-in-production
```
- **Description** : Secret pour signer les cookies de session
- **Recommandation** : Générer une clé aléatoire forte (min 32 caractères)

---

## 🔧 Variables Optionnelles

### OAuth Manus
```
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

### Propriétaire
```
OWNER_OPEN_ID=owner-open-id
OWNER_NAME=Owner Name
```

### APIs Manus
```
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

### Branding
```
VITE_APP_TITLE=Demande Technique AppOps
VITE_APP_LOGO=/logo.png
```

### Analytics
```
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

---

## 📊 OpenTelemetry & Prometheus

### Configuration
```
OTEL_ENABLED=true
OTEL_SERVICE_NAME=jira-ticket-creator
OTEL_SERVICE_VERSION=v1.0.0
OTEL_ENVIRONMENT=dev
OTEL_PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
```

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `OTEL_ENABLED` | Activer OpenTelemetry | `true` |
| `OTEL_SERVICE_NAME` | Nom du service | `jira-ticket-creator` |
| `OTEL_SERVICE_VERSION` | Version du service | `v1.0.0` |
| `OTEL_ENVIRONMENT` | Environnement (dev/staging/prod) | `dev` |
| `OTEL_PROMETHEUS_ENABLED` | Exporter Prometheus | `true` |
| `PROMETHEUS_PORT` | Port pour les métriques | `9090` |

### Accéder aux Métriques
```bash
# Lancer l'application
npm run dev

# Consulter les métriques
curl http://localhost:9090/metrics
```

---

## 🚀 Exemple de Fichier .env Complet

```bash
# Base de données
DATABASE_URL=mysql://root:password123@localhost:3306/jira_db

# Jira
JIRA_DOMAIN=mycompany.atlassian.net
JIRA_EMAIL=devops@mycompany.com
JIRA_API_TOKEN=ATATT3xFfGF0...
JIRA_PROJECT_KEY=OPS

# Sécurité
JWT_SECRET=sk_dev_abc123def456ghi789jkl012mno345pqr

# OpenTelemetry
OTEL_ENABLED=true
OTEL_SERVICE_NAME=jira-ticket-creator
OTEL_ENVIRONMENT=dev
PROMETHEUS_PORT=9090
```

---

## 📝 Checklist de Configuration

- [ ] `DATABASE_URL` - Connexion MySQL configurée
- [ ] `JIRA_DOMAIN` - Domaine Jira valide
- [ ] `JIRA_EMAIL` - Email du compte Jira
- [ ] `JIRA_API_TOKEN` - Token API Jira généré
- [ ] `JIRA_PROJECT_KEY` - Clé du projet Jira
- [ ] `JWT_SECRET` - Secret généré aléatoirement
- [ ] `OTEL_ENABLED` - OpenTelemetry activé (optionnel)
- [ ] `PROMETHEUS_PORT` - Port Prometheus configuré (optionnel)

---

## ⚠️ Notes Importantes

1. **Ne jamais commiter le fichier `.env`** - Utiliser `.env.example` pour la documentation
2. **Générer un JWT_SECRET fort** - Utiliser `openssl rand -base64 32`
3. **Token Jira** - Générer sur https://id.atlassian.com/manage-profile/security/api-tokens
4. **Environnement de production** - Utiliser des variables d'environnement sécurisées (secrets manager, vault, etc.)
5. **Prometheus** - Accessible sur `http://localhost:PROMETHEUS_PORT/metrics`
