# invoice-gen

Generador de facturas. Monorepo: `frontend/` (Next.js 14 App Router + Tailwind), `backend/` (Strapi), `mobile/`.

Todo lo que ve el usuario va **en español**.

---

## Flujo de trabajo (obligatorio)

Documento completo: [`FLUJO-TRABAJO-DEVS.md`](./FLUJO-TRABAJO-DEVS.md). Resumen operativo:

### Ramas

| Rama                            | Entorno    | Acceso                                          |
| ------------------------------- | ---------- | ----------------------------------------------- |
| `main`                          | Producción | Solo por PR desde `develop`, 1 aprobación       |
| `develop`                       | Staging    | Solo por PR desde rama de feature, 1 aprobación |
| `feature/*`, `fix/*`, `chore/*` | Desarrollo | Libre                                           |

**Nunca commitear ni hacer push directo a `main` ni a `develop`.** Están protegidas y el push será rechazado. Si estoy en una de esas ramas y hay que escribir código, primero crear rama desde `develop`:

```bash
git checkout develop && git pull origin develop
git checkout -b feature/nombre-descriptivo
```

Nombres de rama descriptivos (`feature/add-user-profile-images`, `fix/cardindex-eager-loading`), no `feature/cambios` ni `fix/bug`.

### Commits

Convención obligatoria: `feat:` · `fix:` · `chore:` · `refactor:` · `test:` · `docs:`.

Commits atómicos: cada uno coherente y compilable. Nada de "WIP" o "cambios varios".

### Pull requests

- Siempre `feature/*` → `develop`. A `main` solo desde `develop`, cuando está validado en staging.
- Rellenar `.github/PULL_REQUEST_TEMPLATE.md` con contenido real (qué hace, por qué, cómo probarlo, checklist).
- Asignar al menos un revisor y `--assignee @me`.
- Un PR hace **una sola cosa**. Si el cambio es grande, dividirlo en PRs encadenados.
- Merge con **"Squash and merge"**.
- No mergear con tests en rojo o comentarios sin resolver.

Crear el PR con `gh`:

```bash
gh pr create --base develop --assignee @me
```

### Issues

Labels: `bug`, `feature`, `tech-debt`, `blocked`. Referenciar en el PR con `Closes #123`; no cerrarlos a mano.

### Hotfix urgente

Rama `hotfix/descripcion` + PR exprés. Nunca push directo, ni en urgencias.

---

## Reglas del código

### Errores y avisos

Todos los mensajes al usuario pasan por el sistema de toasts: `useToast()` de `frontend/src/components/Toast.tsx`.

- Nunca `alert()`, ni banners de error propios, ni dejar un fallo solo en `console.error`.
- La traducción vive en `frontend/src/lib/errors.ts`. Los mensajes del backend propio ya están en español y pasan intactos; los de Strapi (inglés) se traducen ahí. Si aparece un mensaje nuevo sin traducir, añadirlo al diccionario, no parchearlo en la pantalla.
- Los errores de API se lanzan ya traducidos desde `lib/api.ts` y `lib/auth.ts`: en un `catch` basta `toast.error(e)`.
- Se deja inline lo que es un resultado, no un error (por ejemplo "No se detectaron tareas en el PDF").

### PDF (`frontend/src/components/InvoicePDF.tsx`)

- Generar el PDF **solo bajo demanda**, al hacer clic. Nunca `PDFDownloadLink` ni `PDFViewer` en una pantalla de edición: react-pdf regenera en cada tecla y congela la página.
- **Nunca `minPresenceAhead` en un `View` que pueda ser más alto que una página** (por ejemplo el que envuelve una sección completa). react-pdf entra en un bucle infinito de paginación, y al ser síncrono congela la pestaña y el navegador aborta por timeout. Esa pista va en nodos pequeños, como la cabecera de sección.
- `wrap={false}` recorta el contenido si el nodo no cabe en una página. Para filas con texto largo se estima la altura y se permite el corte (ver `estimateRowHeight`).

### Frontend

- Diseño editorial: papel crema, tinta, Fraunces para display, JetBrains Mono para datos. Usar los tokens existentes (`bg-paper`, `border-ink-200`, `shadow-card`, `font-serif-display`, `font-mono-tight`, `num-dot`), no colores sueltos.
- Importes siempre en mono y alineados a la derecha.
- Permisos: el dueño del equipo edita la cabecera; cada miembro solo sus secciones; una factura `paid` queda congelada. La autorización real está en el backend (`backend/src/api/*/controllers`), el frontend solo la refleja.

### Comprobaciones antes de dar algo por hecho

```bash
cd frontend && ./node_modules/.bin/tsc --noEmit && yarn test && yarn build
cd backend  && yarn test
```

Tests con `node:test` + `tsx` (`tests/*.test.ts`), sin framework extra.

`frontend/tests/invoice-pdf.test.ts` renderiza la factura en un **proceso aparte** con timeout duro: el bucle de paginación de react-pdf es síncrono y desde el propio proceso de test no se puede detectar. Si se toca `InvoicePDF.tsx`, ese test es la red de seguridad — no lo debilites.

Los cambios de UI se verifican en el navegador, no solo con el typecheck.
