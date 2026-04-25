# Strapi Backend Setup

## Instalación rápida

```bash
npx create-strapi-app@latest backend --quickstart
# O con PostgreSQL:
npx create-strapi-app@latest backend --dbclient=postgres
```

## Content Types (crear desde Admin Panel o copiar schemas)

Después de instalar Strapi, crea estos 3 Content Types desde el admin
o copia los archivos de schema en `src/api/`.

---

## Schemas para copiar manualmente

### Invoice (`src/api/invoice/content-types/invoice/schema.json`)

### Section (`src/api/section/content-types/section/schema.json`)

### Task (`src/api/task/content-types/task/schema.json`)

---

## Permisos API (Settings → Users & Permissions → Roles → Public)

Habilitar para `Public`:
- invoice: find, findOne, create, update, delete
- section: find, findOne, create, update, delete
- task: find, findOne, create, update, delete

## Variables de entorno (.env)

```
HOST=0.0.0.0
PORT=1337
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=invoice_gen
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=tu_password
DATABASE_SSL=false
```
