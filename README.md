# UES Valle - Sistema de Gestion

![Logo UES Valle](public/ues.png)

Aplicacion web (SPA) para la gestion administrativa y operativa de prestadores de servicios de acueducto y alcantarillado en el Valle del Cauca.

## 1. Objetivo del repositorio

Este repositorio contiene el frontend del sistema UES Valle, incluyendo:

- Autenticacion y gestion de sesion.
- Control de acceso por rol (`usuario` / `administrador`).
- Modulos operativos (prestadores, muestras, inspeccion, mapa de riesgo, exportacion).
- Dashboard con KPI y graficos.
- Carga masiva de archivos CSV (solo admin).

## 2. Documentacion de entrega

Documentacion ampliada para cliente y equipo tecnico:

- `docs/arquitectura_y_manual.md`
- `docs/diagramas.md`
- `docs/estructura_carpetas.txt`
- `docs/manual_cliente.txt`
- `docs/imagenes_proyecto.txt`
- `docs/imagenes/` (evidencias visuales)

## 3. Rutas y modulos activos

| Ruta | Modulo | Acceso |
|---|---|---|
| `/login` | Login y registro | Publico |
| `/reset-password` | Restablecer/cambiar contrasena | Publico (con validacion de credenciales o sesion) |
| `/dashboard` | Dashboard principal y KPI | Usuario/Admin |
| `/perfil` | Perfil de usuario y cambio de contrasena | Usuario/Admin |
| `/prestadores` | Gestion de prestadores | Usuario/Admin |
| `/prestadores/:id` | Detalle consolidado de prestador | Usuario/Admin |
| `/tecnicos` | Gestion de tecnicos | Usuario/Admin |
| `/solicitantes` | Gestion de solicitantes | Usuario/Admin |
| `/muestras` | Consulta de muestras | Usuario/Admin |
| `/inspeccion` | Consulta de inspeccion sanitaria | Usuario/Admin |
| `/inspeccion/InsercionIndividual` | Resolucion de staging de inspeccion | Usuario/Admin |
| `/mapa` | Mapa de riesgo | Usuario/Admin |
| `/exportar` | Exportacion CSV | Usuario/Admin |
| `/subir` | Carga masiva CSV | Solo Admin |
| `/admin/usuarios` | Administracion de usuarios y roles | Solo Admin |

Rutas adicionales:

- `/` redirige a `/login`.
- `*` muestra `NotFound`.

## 4. Roles y permisos

El sistema maneja dos roles:

- `usuario`: acceso funcional a modulos operativos y consulta.
- `administrador`: acceso adicional a:
  - `Subir` (carga masiva),
  - `Admin Usuarios` (listar perfiles, buscar, cambiar rol, eliminar cuentas).

Controles implementados:

- Frontend: rutas protegidas con `ProtectedRoute` y opcion `requireAdmin`.
- Backend (Supabase): politicas RLS y funciones seguras para operaciones administrativas.

## 5. Funcionalidades destacadas recientes

- Vista `Perfil` con edicion de nombre/correo y cambio de contrasena.
- Vista `ResetPassword` con politica de contrasena y validacion visual de requisitos.
- Vista `Admin Usuarios` con:
  - busqueda server-side (botones `Buscar` / `Limpiar`),
  - cambio de rol via RPC segura,
  - eliminacion de cuentas via RPC segura.
- Dashboard KPI por anio y municipio:
  - resumen general,
  - comparativo por municipio,
  - tendencia mensual.

## 6. Stack tecnologico

- React 18 + TypeScript
- Vite
- Material UI + MUI X DataGrid
- TanStack React Query
- React Router DOM
- Recharts
- React Leaflet
- Supabase (Auth, PostgREST/RPC, Storage)

## 7. Requisitos

- Node.js 18+
- npm 8+
- Proyecto Supabase configurado para esta aplicacion

## 8. Ejecucion local

```bash
git clone <url-del-repositorio>
cd UESvalle-Sistema-de-Gestion
npm install
npm run dev
```

Servidor local por defecto:

- `http://localhost:8080`

## 9. Scripts

```bash
npm run dev        # Desarrollo
npm run build      # Build de produccion
npm run build:dev  # Build en modo development
npm run preview    # Servir build local
npm run lint       # Linter
```

## 10. Supabase y migraciones

Las definiciones SQL se mantienen en `supabase/migrations/`.

Migraciones clave del flujo de administracion:

- `20260226112601_profiles_admin_policies.sql` (RLS y validaciones de perfiles)
- `20260227072306_fix_current_user_is_admin_trim.sql` (normalizacion de rol admin)
- `20260227082015_admin_update_user_role_rpc.sql` (RPC segura para cambio de rol)
- `20260226114632_admin_delete_user_account.sql` (RPC segura para eliminar cuentas)

Nota operativa:

- Aplique migraciones en su proyecto Supabase antes de probar flujos de admin.
- Mantenga `src/integrations/supabase/types.ts` sincronizado con el esquema actual.

## 11. Estructura del proyecto (resumen)

- `src/pages/` vistas de negocio
- `src/components/` layout, sidebar, proteccion de rutas y componentes base
- `src/contexts/` contexto de autenticacion y rol
- `src/integrations/supabase/` cliente y tipado de base de datos
- `public/templates/` plantillas CSV de carga
- `docs/` documentacion funcional y tecnica
- `supabase/migrations/` versionado SQL

Detalle completo:

- `docs/estructura_carpetas.txt`

## 12. Seguridad de configuracion

Por politica de seguridad:

- Este README no expone variables de entorno ni secretos.
- No versionar claves ni credenciales.
- Gestionar parametros sensibles solo en entornos seguros (local/CI/CD/plataforma).

## 13. Despliegue

El repositorio incluye `vercel.json` para SPA rewrite.

Flujo recomendado:

1. Conectar repositorio en Vercel.
2. Configurar parametros de entorno en la plataforma.
3. Ejecutar build y validar rutas protegidas/publicas.

## 14. Modulos implementados no publicados en rutas activas

Actualmente existen paginas sin ruta activa en `App.tsx`:

- `src/pages/Laboratorio.tsx`
- `src/pages/Reportes.tsx`
