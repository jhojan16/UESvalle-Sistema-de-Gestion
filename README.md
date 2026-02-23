# UES Valle - Sistema de Gestion

![Logo UES Valle](public/ues.png)

Aplicacion web para la gestion administrativa y operativa de prestadores de servicios de acueducto y alcantarillado.

## 1. Proposito del repositorio

Este repositorio contiene el frontend del sistema de gestion de UES Valle, desarrollado como SPA (Single Page Application). El sistema integra autenticacion, consulta de datos, operaciones CRUD, carga masiva de archivos CSV y exportacion de informacion.

## 2. Documentacion de entrega

Para documentacion detallada de arquitectura, operacion y anexos:

- Manual tecnico y funcional: `docs/arquitectura_y_manual.md`
- Diagramas: `docs/diagramas.md`
- Estructura de carpetas: `docs/estructura_carpetas.txt`
- Manual en formato texto para cliente: `docs/manual_cliente.txt`
- Inventario de imagenes del proyecto: `docs/imagenes_proyecto.txt`

## 3. Alcance funcional actual

Modulos accesibles desde menu lateral:

| Ruta | Modulo | Objetivo |
|---|---|---|
| `/dashboard` | Dashboard | Indicadores generales y graficos de soporte |
| `/prestadores` | Prestadores | CRUD de prestadores y acceso a detalle |
| `/prestadores/:id` | Detalle de prestador | Vista consolidada de inspecciones, muestras y mapas |
| `/tecnicos` | Tecnicos | CRUD de tecnicos y asociacion a laboratorio/ubicacion |
| `/solicitantes` | Solicitantes | CRUD de solicitantes y relacion con ubicacion |
| `/muestras` | Muestras | Consulta, filtros exactos y detalle analitico |
| `/inspeccion` | Inspeccion sanitaria | Busqueda, paginacion y detalle por inspeccion |
| `/inspeccion/InsercionIndividual` | Resolver duplicados | Resolucion manual de staging de inspecciones |
| `/mapa` | Mapa de riesgo | Mapa interactivo y panel tecnico de relaciones |
| `/exportar` | Exportacion | Vista previa y descarga CSV |
| `/subir` | Carga masiva | Carga CSV y procesamiento por funciones remotas |
| `/login` | Autenticacion | Inicio de sesion y registro de usuarios |

Rutas tecnicas adicionales:

- `*` -> pagina `NotFound`
- `/` -> redireccion a `/login`

## 4. Stack tecnologico

- React 18 + TypeScript
- Vite
- Material UI + Tailwind CSS + utilidades de componentes UI
- TanStack React Query
- Supabase (Auth, PostgREST, Storage, Functions)
- React Router
- DataGrid (MUI X)
- Recharts (dashboard)
- React Leaflet (mapas)

## 5. Requisitos

- Node.js 18 o superior
- npm 8 o superior
- Acceso a un proyecto Supabase configurado para este sistema

## 6. Instalacion local

1. Clonar el repositorio.
2. Instalar dependencias.
3. Crear archivo de configuracion local a partir de `.env.example`.
4. Completar credenciales en el archivo local de entorno.
5. Ejecutar servidor de desarrollo.

Comandos:

```bash
git clone <url-del-repositorio>
cd UESvalle-Sistema-de-Gestion
npm install
npm run dev
```

Servidor local por defecto:

- `http://localhost:8080`

## 7. Politica de seguridad para credenciales

Por politica de seguridad de entrega a cliente:

- Este README no publica nombres ni valores de variables de entorno.
- No se deben versionar secretos o llaves en el repositorio.
- Toda configuracion sensible debe mantenerse fuera de documentos publicos.

## 8. Scripts disponibles

```bash
npm run dev        # Desarrollo
npm run build      # Build produccion
npm run build:dev  # Build modo desarrollo
npm run preview    # Previsualizar build
npm run lint       # Linter
```

## 9. Estructura de proyecto (resumen)

- `src/` codigo fuente de aplicacion
- `src/pages/` modulos/paginas de negocio
- `src/components/` layout, sidebar, proteccion de rutas y UI
- `src/contexts/` contexto de autenticacion
- `src/integrations/supabase/` cliente y tipos de base de datos
- `public/templates/` plantillas CSV para carga masiva
- `docs/` documentacion funcional, tecnica y anexos de entrega
- `supabase/migrations/` snapshot de esquema para referencia

Estructura completa:

- Ver `docs/estructura_carpetas.txt`

## 10. Despliegue

El proyecto incluye `vercel.json` con rewrite para SPA.

Flujo sugerido:

1. Conectar repositorio en Vercel.
2. Configurar secretos y parametros de entorno en la plataforma.
3. Ejecutar build y validar navegacion por rutas privadas/publicas.

## 11. Notas de operacion

- Todas las rutas de negocio requieren sesion activa.
- El modulo de carga masiva requiere que el usuario este autenticado y tenga permisos sobre Storage/Functions.
- La exportacion utiliza una funcion remota y descarga CSV desde el navegador.

## 12. Modulos implementados pero no expuestos en menu principal

Existen paginas en el codigo que actualmente no estan enlazadas en rutas visibles del `App.tsx`:

- `src/pages/Laboratorio.tsx`
- `src/pages/Reportes.tsx`

Estas piezas pueden documentarse como funcionalidad tecnica disponible para futura publicacion.

## 13. Soporte y mantenimiento

Para cambios futuros se recomienda:

1. Mantener sincronizados los tipos de Supabase con el esquema real.
2. Versionar cambios en documentacion junto con cambios funcionales.
3. Validar manualmente los flujos criticos: login, CRUD principal, carga masiva y exportacion.
