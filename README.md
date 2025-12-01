# TaskFlow Pro — Projet de démonstration
## Prérequis
- Node.js 20+ : https://nodejs.org
- pnpm : npm install -g pnpm
- PostgreSQL installé localement (ou Docker)

## Installation

```bash
# 1. Installer les dépendances
pnpm install

# 2. Configurer la base de données
# Créer un fichier .env dans le dossier racine :
echo "DATABASE_URL=postgresql://user:password@localhost:5432/taskflow" > .env

# 3. Créer les tables
pnpm --filter @workspace/db run push

# 4. Lancer le projet (backend + frontend)
# Terminal 1 — Backend API
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/taskflow-pro run dev
```

## Accès
- Frontend : http://localhost:3000
- API : http://localhost:8080/api

## Stack technique
- Frontend : React 18, Vite, Tailwind CSS, TanStack Query
- Backend : Node.js 24, Express 5, TypeScript
- Base de données : PostgreSQL + Drizzle ORM
- Validation : Zod + OpenAPI 3.1

## Structure
```
taskflow-pro/
├── artifacts/
│   ├── taskflow-pro/   # Frontend React + Vite
│   └── api-server/     # Backend Express 5
├── lib/
│   ├── api-spec/       # Spec OpenAPI 3.1
│   ├── api-client-react/ # Hooks React générés
│   ├── api-zod/        # Schémas Zod générés
│   └── db/             # Drizzle ORM + schéma PostgreSQL
└── package.json
```

Développé par Djochrist K. — djochristkfreelance@gmail.com | +243 819 730 124
