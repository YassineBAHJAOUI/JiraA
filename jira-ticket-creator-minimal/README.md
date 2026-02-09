# Jira Ticket Creator - Docker

Application web pour créer automatiquement des tickets Jira.

## 📁 Structure du Projet

```
jira-ticket-creator-minimal/
├── README.md                  # Ce fichier
└── data/                      # Code source
    ├── Dockerfile             # Pour builder l'image Docker
    ├── version                # Numéro de version (v1.0.0)
    ├── .dockerignore          # Fichiers à ignorer en build
    ├── package.json           # Dépendances Node.js
    ├── client/                # Frontend React (formulaire)
    ├── server/                # Backend Node.js (API Jira)
    ├── drizzle/               # Base de données
    ├── shared/                # Code partagé
    └── ... (fichiers config)
```

## 🚀 Build Docker

```bash
cd data

# Build l'image
docker build \
  --build-arg VERSION="v1.0.0" \
  --build-arg IMAGE_NAME="jira-ticket-creator" \
  -t jira-ticket-creator:v1.0.0 \
  .

# Pousser sur Artifactory
docker tag jira-ticket-creator:v1.0.0 \
  repository.saas.cagip.group.gca/cats-p0267-docker-scratch-intranet/jira-ticket-creator:v1.0.0

docker push \
  repository.saas.cagip.group.gca/cats-p0267-docker-scratch-intranet/jira-ticket-creator:v1.0.0
```

## 📋 Variables d'Environnement

Créer un fichier `.env` dans `data/` :

```
DATABASE_URL=mysql://user:password@host:3306/db
JIRA_DOMAIN=instance.atlassian.net
JIRA_EMAIL=email@example.com
JIRA_API_TOKEN=your-token
JIRA_PROJECT_KEY=OPS
JWT_SECRET=your-secret
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=owner-id
OWNER_NAME=Owner
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-key
VITE_FRONTEND_FORGE_API_KEY=your-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_APP_TITLE=Demande Technique AppOps
VITE_APP_LOGO=/logo.png
```

## 🧩 Qu'est-ce que chaque dossier ?

| Dossier | Utilité |
|---------|---------|
| **client/** | Interface web (formulaire pour créer les tickets) |
| **server/** | API backend (crée les tickets Jira) |
| **drizzle/** | Configuration base de données |
| **shared/** | Code utilisé par client et server |

## 📝 Fichiers Importants

| Fichier | Utilité |
|---------|---------|
| **Dockerfile** | Construit l'image Docker |
| **package.json** | Liste des dépendances Node.js |
| **version** | Numéro de version (à mettre à jour) |
| **.dockerignore** | Fichiers à ignorer en build |
| **vite.config.ts** | Configuration du build frontend |
| **tsconfig.json** | Configuration TypeScript |

## 🔄 Workflow

1. Modifier le code dans `client/` ou `server/`
2. Mettre à jour la version dans `data/version`
3. Builder l'image Docker
4. Pousser sur Artifactory
5. Déployer sur Kubernetes avec ArgoCD
