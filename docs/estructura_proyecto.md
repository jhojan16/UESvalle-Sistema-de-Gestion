# Estructura del Proyecto - UES Valle

Documento tecnico de referencia para entender la organizacion de carpetas, modulos y flujo general del proyecto.

## 1. Arbol principal

```text
UESvalle-Sistema-de-Gestion/
|-- docs/
|   |-- estructura_proyecto.md
|   `-- imagenes/
|       |-- placeholder.svg
|       `-- ues_logo.png
|-- public/
|   |-- favicon.ico
|   |-- placeholder.svg
|   |-- robots.txt
|   |-- ues.png
|   `-- templates/
|       |-- inspeccion.csv
|       |-- mapa de riesgo.csv
|       `-- muestra.csv
|-- src/
|   |-- components/
|   |   |-- AppLoader.tsx
|   |   |-- AppSidebar.tsx
|   |   |-- Layout.tsx
|   |   |-- ProtectedRoute.tsx
|   |   `-- ui/
|   |       |-- sonner.tsx
|   |       |-- toast.tsx
|   |       |-- toaster.tsx
|   |       `-- tooltip.tsx
|   |-- contexts/
|   |   `-- AuthContext.tsx
|   |-- hooks/
|   |   |-- use-mobile.tsx
|   |   `-- use-toast.ts
|   |-- integrations/
|   |   `-- supabase/
|   |       |-- client.ts
|   |       |-- index.ts
|   |       `-- types.ts
|   |-- lib/
|   |   `-- utils.ts
|   |-- pages/
|   |   |-- AdminUsuarios.tsx
|   |   |-- Dashboard.tsx
|   |   |-- Index.tsx
|   |   |-- InsercionIndividual.tsx
|   |   |-- Inspeccion.tsx
|   |   |-- Laboratorio.tsx
|   |   |-- Login.tsx
|   |   |-- MapaRiesgo.tsx
|   |   |-- Muestras.tsx
|   |   |-- NotFound.tsx
|   |   |-- Perfil.tsx
|   |   |-- PrestadorDetalle.tsx
|   |   |-- Prestadores.tsx
|   |   |-- Reportes.tsx
|   |   |-- ResetPassword.tsx
|   |   |-- Solicitantes.tsx
|   |   |-- Tecnico.tsx
|   |   |-- VistaExportar.tsx
|   |   `-- VistaUpload.tsx
|   |-- theme/
|   |   `-- muiTheme.ts
|   |-- App.tsx
|   |-- index.css
|   `-- main.tsx
|-- supabase/
|   |-- config.toml
|   |-- schema_tables_functions_snapshot.sql
|   |-- migrations/
|   `-- .temp/
|-- .env
|-- .env.example
|-- .gitignore
|-- components.json
|-- eslint.config.js
|-- index.html
|-- package.json
|-- package-lock.json
|-- postcss.config.js
|-- README.md
|-- tailwind.config.ts
|-- tsconfig.app.json
|-- tsconfig.json
|-- tsconfig.node.json
|-- vercel.json
`-- vite.config.ts
```

## 2. Estructura funcional por capas

### 2.1 Capa de aplicacion (`src/`)

- `main.tsx`: punto de entrada, inyecta `ThemeProvider`, `CssBaseline` y `App`.
- `App.tsx`: define `BrowserRouter`, `AuthProvider`, lazy loading y mapa de rutas.
- `theme/muiTheme.ts`: tema global de Material UI.

### 2.2 Capa de seguridad y sesion

- `contexts/AuthContext.tsx`:
  - maneja `user`, `session`, `role`, `isAdmin`,
  - integra login, registro, cierre de sesion,
  - resuelve el rol desde `profiles`.
- `components/ProtectedRoute.tsx`:
  - protege rutas por autenticacion,
  - usa `requireAdmin` para rutas exclusivas de administrador.

### 2.3 Capa de layout y UI base

- `components/Layout.tsx`: contenedor principal con sidebar + area de contenido.
- `components/AppSidebar.tsx`: navegacion lateral, items por rol y boton de cierre de sesion.
- `components/AppLoader.tsx`: estado de carga reutilizable.
- `components/ui/*`: wrappers/utilidades de UI (toast, toaster, tooltip, sonner).

### 2.4 Capa de integracion de datos (Supabase)

- `integrations/supabase/client.ts`: cliente Supabase tipado.
- `integrations/supabase/types.ts`: tipos de tablas, vistas y funciones RPC.
- `integrations/supabase/index.ts`: punto de export central de integracion.

### 2.5 Capa de vistas (`pages/`)

Vistas montadas en rutas activas:

- `Login.tsx`
- `ResetPassword.tsx`
- `Dashboard.tsx`
- `Perfil.tsx`
- `Prestadores.tsx`
- `PrestadorDetalle.tsx`
- `Tecnico.tsx`
- `Solicitantes.tsx`
- `Muestras.tsx`
- `Inspeccion.tsx`
- `InsercionIndividual.tsx`
- `MapaRiesgo.tsx`
- `VistaExportar.tsx`
- `VistaUpload.tsx` (admin)
- `AdminUsuarios.tsx` (admin)
- `NotFound.tsx`

Vistas presentes sin ruta activa actual:

- `Index.tsx`
- `Laboratorio.tsx`
- `Reportes.tsx`

## 3. Supabase y SQL en el repo

- `supabase/config.toml`: configura el `project_ref` local.
- `supabase/schema_tables_functions_snapshot.sql`: snapshot de referencia de tablas y funciones.
- `supabase/migrations/`: carpeta reservada para migraciones SQL versionadas.
- `supabase/.temp/`: archivos temporales de la CLI (ignorados por Git).

## 4. Flujo operativo resumido

1. Usuario inicia sesion en `Login`.
2. `AuthContext` resuelve sesion y rol.
3. `ProtectedRoute` habilita/bloquea vistas segun sesion y rol.
4. Cada pagina consulta Supabase con:
   - `supabase.from(...)` para tablas,
   - `supabase.rpc(...)` para funciones SQL.
5. En dashboard se combinan KPIs base y funciones RPC para construir graficos y filtros.
6. En admin, cambios de rol y eliminacion de cuentas se realizan por RPC de servidor.

## 5. Convenciones practicas para mantener el proyecto

- Registrar cada cambio SQL en `supabase/migrations/` antes de desplegar.
- Mantener sincronizado `src/integrations/supabase/types.ts` con el esquema de Supabase.
- No subir secretos en `.env` ni en documentacion.
- Conservar `docs/estructura_proyecto.md` actualizado cuando se agreguen rutas o modulos nuevos.
