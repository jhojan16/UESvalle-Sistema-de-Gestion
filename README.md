# UES Valle - Sistema de Gestion

![Logo UES Valle](public/ues.png)

Aplicacion web SPA para la gestion administrativa y operativa de prestadores de acueducto y alcantarillado en el Valle del Cauca.

## Resumen

Este repositorio contiene el frontend React + TypeScript y la integracion con Supabase para:

- autenticacion y sesion,
- control de acceso por rol (`usuario` / `administrador`),
- dashboard con KPI y graficos,
- modulos operativos (prestadores, muestras, inspeccion, mapa de riesgo),
- carga masiva CSV y administracion de usuarios (solo admin).

## Stack

- React 18
- TypeScript
- Vite
- Material UI + MUI X DataGrid
- TanStack React Query
- React Router DOM
- Recharts
- React Leaflet
- Supabase (`auth`, `storage`, `rpc`, consultas `from`)

## Rutas activas

| Ruta | Vista | Acceso |
|---|---|---|
| `/login` | Login | Publico |
| `/reset-password` | Cambio/restablecimiento de contrasena | Publico |
| `/dashboard` | Vista general + KPI | Usuario/Admin |
| `/perfil` | Perfil de usuario | Usuario/Admin |
| `/prestadores` | Listado de prestadores | Usuario/Admin |
| `/prestadores/:id` | Detalle de prestador | Usuario/Admin |
| `/tecnicos` | Gestion de tecnicos | Usuario/Admin |
| `/solicitantes` | Gestion de solicitantes | Usuario/Admin |
| `/muestras` | Modulo de muestras | Usuario/Admin |
| `/inspeccion` | Inspeccion sanitaria | Usuario/Admin |
| `/inspeccion/InsercionIndividual` | Resolver staging de inspeccion | Usuario/Admin |
| `/mapa` | Mapa de riesgo | Usuario/Admin |
| `/exportar` | Exportacion | Usuario/Admin |
| `/subir` | Carga masiva CSV | Solo Admin |
| `/admin/usuarios` | Gestion de usuarios/roles | Solo Admin |

Rutas auxiliares:

- `/` redirige a `/login`.
- `*` carga `NotFound`.

## Autorizacion y seguridad funcional

- `ProtectedRoute` bloquea vistas sin sesion.
- `ProtectedRoute requireAdmin` bloquea vistas administrativas.
- `AuthContext` obtiene rol desde `profiles.rol` y expone `isAdmin`.
- Admin usuarios usa RPC:
  - `admin_update_user_role`
  - `admin_delete_user_account`

## KPI de dashboard (consumo frontend)

Funciones RPC usadas desde `src/pages/Dashboard.tsx`:

- `dashboard_irca_por_municipio`
- `dashboard_prestadores_por_departamento`
- `dashboard_top_municipios`
- `dashboard_kpis_resumen`
- `dashboard_kpis_por_municipio`
- `dashboard_kpis_tendencia_mensual`
- `dashboard_kpis_anios_disponibles`

## Estructura del proyecto

Resumen rapido:

- `src/pages/`: vistas principales.
- `src/components/`: layout, sidebar, loaders, proteccion de rutas.
- `src/contexts/`: contexto de autenticacion y rol.
- `src/integrations/supabase/`: cliente y tipos de base de datos.
- `public/templates/`: plantillas CSV de carga.
- `docs/`: documentacion del proyecto.
- `supabase/`: configuracion local y snapshots SQL.

Detalle completo:

- `docs/estructura_proyecto.md`

## Requisitos

- Node.js 18+
- npm 8+
- Variables de entorno configuradas para Supabase

## Variables de entorno

Crear `.env` (o usar tu configuracion de entorno) con:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

## Ejecucion local

```bash
npm install
npm run dev
```

Por defecto Vite levanta en `http://localhost:8080`.

## Scripts

```bash
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
```

## Supabase en este repositorio

- `supabase/config.toml`: referencia del proyecto linkeado.
- `supabase/schema_tables_functions_snapshot.sql`: snapshot local de tablas y funciones.
- `supabase/migrations/`: carpeta para migraciones SQL versionadas.

Nota:

- `supabase/.temp/` esta ignorado en `.gitignore`.
- No versionar secretos ni tokens.

## Modulos existentes sin ruta activa

Archivos presentes en `src/pages/` pero no montados en `App.tsx`:

- `src/pages/Index.tsx`
- `src/pages/Laboratorio.tsx`
- `src/pages/Reportes.tsx`

## Despliegue

El repo incluye `vercel.json` para soporte SPA (rewrite de rutas).  
Configura variables de entorno en la plataforma antes del build.
