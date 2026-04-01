![Node.js](https://img.shields.io/badge/Node.js-24-green?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Express](https://img.shields.io/badge/Express-5-black?style=flat-square&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?style=flat-square&logo=postgresql)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-Latest-38B2AC?style=flat-square&logo=tailwind-css)
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)

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