# 🧾 Invoice Generator

Generador de facturas multi-sección con soporte para tareas, horas opcionales, y exportación a PDF.

## Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js Web   │────▶│  Strapi Backend   │◀────│  React Native   │
│  (Tailwind CSS) │     │   (PostgreSQL)    │     │    (Expo)       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │
        ▼                        ▼
   PDF Generation          REST API + Admin
  (@react-pdf)              Panel Strapi
```

## Modelo de Datos (Strapi)

```
Invoice (factura)
├── number          : string (unique) — "25/2026"
├── date            : date
├── status          : enum [draft, sent, paid, cancelled]
├── currency        : string — "USD"
├── companyName     : string
├── companyCIF      : string
├── companyAddress  : text
├── clientName      : string
├── clientIBAN      : string
├── clientSwift     : string
├── clientBank      : text
├── notes           : text
├── totalAmount     : float (computed)
└── sections        : relation hasMany → Section

Section (sección)
├── title           : string — "Tareas de Desarrollo (Front-Febrero)"
├── subtitle        : string — nombre del dev
├── sortOrder       : integer
├── subtotal        : float (computed)
├── invoice         : relation belongsTo → Invoice
└── tasks           : relation hasMany → Task

Task (tarea)
├── number          : integer — nº de fila
├── code            : string — "TF-230", "TIK-571"
├── description     : text
├── amount          : float
├── hours           : float (opcional)
├── sortOrder       : integer
└── section         : relation belongsTo → Section
```

## Setup

### 1. Strapi Backend

```bash
cd backend
npm install
# Configurar .env con tu PostgreSQL
cp .env.example .env
npm run develop
```

Strapi se abre en http://localhost:1337/admin
Crear admin user y configurar permisos de la API.

### 2. Frontend Next.js

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Se abre en http://localhost:3000

### 3. Mobile React Native

```bash
cd mobile
npm install
npx expo start
```

## Generar PDF

El PDF se genera client-side usando `@react-pdf/renderer`.
El diseño replica exactamente el formato de la factura de ejemplo.
