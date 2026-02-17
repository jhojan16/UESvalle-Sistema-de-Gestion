# UES Valle - Arquitectura y Manual de Usuario

Documentación de alto nivel para el cliente sobre cómo está construido el sistema y cómo usar cada módulo.

## 1. Visión general
- Aplicación web SPA hecha en React 18 + TypeScript, construida con Vite.
- UI basada en Material UI (MUI) más utilidades de Tailwind/Shadcn para componentes y estilos.
- Datos y autenticación en Supabase (Postgres + Auth + Storage + Edge Functions). Tipado generado automáticamente en `src/integrations/supabase/types.ts`.
- Gestión de datos cliente con TanStack React Query (caché, revalidación y control de estados de carga/errores).
- Navegación protegida con React Router + contexto de autenticación (Supabase Auth).

## 2. Arquitectura técnica
### Frontend
- **Routing:** `src/App.tsx` define rutas públicas (`/login`) y privadas (`/dashboard`, `/prestadores`, `/muestras`, `/mapa`, etc.) envueltas en `ProtectedRoute`, que redirige a login si no hay sesión.
- **Layout:** `src/components/Layout.tsx` arma la estructura principal (sidebar + contenido). `AppSidebar` (MUI Drawer) contiene los accesos a cada módulo.
- **Estado de datos:** React Query encapsula llamadas a Supabase y gestiona caché y paginación. Cada página define sus `queryKey` y mutaciones para invalidar y refrescar listas tras crear/editar/eliminar.
- **Autenticación:** `src/contexts/AuthContext.tsx` usa Supabase Auth. Persistencia de sesión en `localStorage`, auto-refresh de tokens y redirecciones después de login/logout.
- **Tema y estilos:** `src/theme/muiTheme.ts` define paleta institucional (azul/verde) y tipografía base. `index.css` y `App.css` aportan estilos globales y utilidades.

### Integración con Supabase
- **Cliente:** `src/integrations/supabase/client.ts` crea el cliente con `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **Modelos/tipos:** `src/integrations/supabase/index.ts` expone alias tipados para tablas clave (prestador, laboratorio, muestra, inspeccion, mapa_riesgo, etc.) y modelos compuestos como `MapaRiesgoCompleto` y `MuestraCompleta`.
- **Tablas principales usadas en UI:** `prestador`, `ubicacion`, `laboratorio`, `tecnico`, `solicitante`, `muestra` (con `analisis_muestra` y `punto_muestreo`), `inspeccion`, `mapa_riesgo` (con anexos, bocatoma, red, resolucion, seguimiento, riesgo, seguridad), tablas de staging (`inspeccion_staging`) y vistas auxiliares de duplicados (`inspeccion_staging_nits_duplicados`).
- **Edge Functions / RPC:**
  - `export_csv_full`: usada en **Exportar** para descargar CSV completo o vista previa.
  - `muestra_insert`, `super-handler` (inspección) y `mapaRiesgo`: usadas en **Carga Masiva** para procesar archivos CSV subidos al bucket `imports`.
  - Funciones RPC en DB (ej. `procesar_inspeccion_staging`, `procesar_muestra_staging`) listadas en `types.ts`, disponibles para automatizaciones.
- **Storage:** bucket `imports` recibe los CSV de carga masiva; las funciones leen desde la ruta `tmp/<userId>/<id>-<archivo>.csv`.

### Estructura de carpetas (src/)
- `components/`: Layout, sidebar y wrappers de UI (`ProtectedRoute`, toasts y tooltips).
- `contexts/`: `AuthContext` (sesión y acciones de auth).
- `hooks/`: utilidades (toast, detección mobile).
- `integrations/supabase/`: cliente, tipos generados y modelos compuestos.
- `pages/`: cada módulo funcional (Dashboard, Prestadores, PrestadorDetalle, Muestras, Laboratorio, Tecnico, Solicitantes, Inspeccion, InsercionIndividual, MapaRiesgo, Exportar, Upload, Reportes, Login, NotFound).
- `theme/`: tema MUI.
- `lib/`: utilidades comunes (`utils.ts`).

### Flujo de navegación y seguridad
1) Usuario ingresa a `/login`; AuthContext gestiona `signIn`/`signUp` con Supabase Auth.
2) Rutas privadas se renderizan sólo si `user` y `session` están presentes; si no, `ProtectedRoute` redirige a `/login`.
3) Cada página usa React Query para consultar Supabase; las mutaciones invalidan cachés relacionadas para refrescar vistas.

### Construcción y despliegue
- Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.
- Variables de entorno requeridas: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (y opcionalmente `VITE_SUPABASE_PROJECT_ID` para referencias). Deben configurarse en `.env` local y en el proveedor de despliegue.

## 3. Detalle por módulo (implementación resumida)
- **Dashboard (`/dashboard`):** Estadísticas de conteo (prestadores, muestras, mapas de riesgo, inspecciones) y gráficos con Recharts. Agrega promedios de IRCA por municipio y distribución geográfica de prestadores.
- **Prestadores (`/prestadores`):** CRUD completo. Al crear/editar se inserta/actualiza la ubicación y luego el prestador. Incluye búsqueda por nombre/NIT, paginación y acceso al detalle.
- **Detalle de Prestador (`/prestadores/:id`):** Panel con info general, representante, ubicación, mapa de puntos de captación (Leaflet), y tabs para inspecciones, muestras y mapas de riesgo. Permite ver anexos, bocatomas y redes cuando existen.
- **Muestras (`/muestras`):** Listado paginado y buscador exacto por número de muestra, NIT o fecha. Detalle en modal con secciones: información general, resultados de laboratorio (`analisis_muestra`), punto de muestreo, prestador y laboratorio.
- **Laboratorios (`/laboratorios`):** Grid de tarjetas, buscador y eliminación. Formulario de creación/edición (dirección editable sólo en edición).
- **Técnicos (`/tecnicos`):** CRUD con selección de laboratorio y ubicación; confirmación de eliminación y búsqueda por nombre/profesión/email.
- **Solicitantes (`/solicitantes`):** CRUD con selección de ubicación existente (`ubicacion_solicitante`). Búsqueda por nombre/estado.
- **Inspecciones (`/inspeccion`):** Vista tipo tarjetas con filtros exactos (ID SIVICAP, fecha, NIT o nombre de prestador). Detalle en modal con datos generales e info del prestador.
- **Resolver duplicados (Inserción Individual, `/InsercionIndividual`):** Muestra NIT duplicados en `inspeccion_staging`, permite asignar manualmente el `id_prestador` correcto y enviar a tabla final `inspeccion`, marcando y eliminando los registros procesados.
- **Mapa de Riesgo (`/mapa`):** Mapa Leaflet con puntos de captación; panel lateral para ver detalles del prestador, captación, anexos, redes, bocatomas, resoluciones y seguimientos asociados.
- **Exportar (`/exportar`):** Invoca función `export_csv_full` para descargar CSV completo. Incluye vista previa de primeras filas en DataGrid si se solicita.
- **Carga Masiva (`/subir`):** Selecciona tipo (Mapa de riesgo, Muestras, Inspecciones), descarga plantilla CSV, sube archivo al bucket y llama la función correspondiente. Muestra estado de éxito/error.
- **Reportes (`/reportes`):** Distribución por estado (pie chart) de `reporte` con filtro por estado y listado por grupo.
- **Login (`/login`):** Tabs de ingreso/registro; tras éxito redirige a Dashboard.

## 4. Manual de usuario (operación)
### Requisitos previos
- Contar con un usuario válido en Supabase (registro disponible en la pantalla de login).
- Variables de entorno configuradas en despliegue para conectar con la instancia de Supabase.

### Ingreso y salida
1. Ir a `/login`.
2. **Iniciar sesión:** ingresar correo y contraseña, luego "Iniciar Sesión".
3. **Registrarse:** cambiar a la pestaña "Registrarse", ingresar nombre, correo y contraseña (mínimo 6 caracteres) y enviar.
4. Tras login, el sistema redirige a Dashboard. El botón "Cerrar sesión" está al final del menú lateral.

### Navegación general
- Menú lateral (AppSidebar) con accesos a cada módulo. Puede contraerse/expandirse con el ícono superior.
- Todas las vistas privadas requieren sesión; si expira, se redirige a login.

### Operaciones por módulo
- **Dashboard:** Lectura de tarjetas de conteo; gráficos de distribución geográfica de prestadores y de IRCA por municipio.
- **Prestadores:**
  - Buscar por nombre o NIT.
  - Crear/Editar: botón "Nuevo Prestador" o acción de lápiz; completar datos generales (nombre, NIT, sistema, teléfonos, códigos) y ubicación (departamento, municipio, vereda). Ubicación es obligatoria.
  - Eliminar: ícono de papelera (confirma); también borra la ubicación asociada.
  - Ver detalle: ícono de ojo abre `/prestadores/:id`.
- **Detalle de Prestador:**
  - Ver info general, representante y ubicación.
  - Mapa de puntos de captación: clic en marcador muestra popup; lista de mapas abajo.
  - Tabs: Inspecciones, Muestras y Mapas de riesgo con DataGrid. Al seleccionar un mapa, se despliegan tablas de bocatoma y red si existen.
- **Solicitantes:**
  - Buscar por nombre/estado.
  - Crear/Editar: completar nombre, estado y elegir ubicación desde catálogo.
  - Eliminar: acción de papelera (confirmación).
- **Técnicos:**
  - Buscar por nombre, profesión o email.
  - Crear/Editar: ingresar identificación, nombre, profesión, contacto; seleccionar laboratorio y ubicación desde catálogos.
  - Eliminar: acción de papelera con confirmación.
- **Laboratorios:**
  - Buscar por nombre/email/teléfono.
  - Crear/Editar: nombre, estado, teléfonos, email; dirección (sólo editable en edición).
  - Eliminar: acción de papelera (confirmación).
- **Muestras:**
  - Vista principal paginada; filtros exactos por número de muestra, NIT o fecha.
  - Abrir detalle (ícono de ojo): muestra información general, resultados por parámetro (`analisis_muestra`), punto de muestreo, datos del prestador y laboratorio.
  - Cambiar página/tamaño desde la barra inferior del DataGrid.
- **Inspecciones Sanitarias:**
  - Filtrar exacto por ID SIVICAP, fecha, NIT o nombre del prestador.
  - Hacer clic en una tarjeta para ver detalle (concepto, índices, viviendas/habitantes, plan de mejoramiento, datos del prestador).
  - Navegar páginas con botones "Anterior/Siguiente" cuando no hay filtro activo.
- **Resolución de duplicados (Inserción Individual):**
  - Elegir un NIT duplicado en la lista.
  - Para cada fila, seleccionar el prestador correcto (si hay coincidencia única se preselecciona).
  - Revisar/editar campos si es necesario.
  - Enviar: mueve los registros listos a `inspeccion` y marca/elimina los staging asociados. "Cancelar" revierte cambios en el borrador actual.
- **Mapa de Riesgo:**
  - Mapa interactivo: clic en marcador abre el panel derecho con detalles del mapa de riesgo.
  - Buscador por ID de mapa, nombre/NIT del prestador o municipio del punto de captación.
  - Secciones expandibles con información técnica de anexos, características priorizadas, documentos fuente, bocatomas, redes, resoluciones y seguimiento.
- **Exportar:**
  - Botón "Descargar CSV Completo" invoca la función `export_csv_full`.
  - Opcional: "Ver Vista Previa" carga primeras filas en un DataGrid para inspección rápida.
- **Carga Masiva (Subir):**
  - Paso 1: seleccionar tipo (Mapa de riesgo, Muestras, Inspecciones).
  - Paso 2: descargar plantilla CSV correspondiente.
  - Paso 3: elegir archivo CSV y subir. El sistema lo guarda en Storage y llama la función adecuada. Se muestra mensaje de éxito o error con el cuerpo devuelto por la función.
- **Reportes por Estado:**
  - Gráfico de pie con distribución de `reporte` por estado.
  - Filtro de estado; el listado inferior se actualiza según la selección.
- **Login/NotFound:** Autenticación y pantalla de ruta no encontrada.

### Buenas prácticas de uso
- Mantener sesión activa: si el token expira, volver a iniciar sesión.
- Para cargas masivas, usar siempre las plantillas oficiales y respetar encabezados/formatos.
- En formularios, los campos numéricos (códigos, índices, IRCA) deben ingresarse sin caracteres extra.
- Antes de eliminar registros, confirmar que no se requieren las relaciones (p.ej. prestador con ubicaciones).

## 5. Configuración operativa
- Variables de entorno: definir `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en `.env` y en la plataforma de despliegue.
- Dependencias clave: React, MUI, TanStack Query, Supabase JS, React Router, Leaflet, Recharts, Sonner (toasts).
- Scripts de NPM: `dev` (desarrollo), `build` (producción), `preview` (servir build), `lint` (calidad).
- Deploy recomendado: Vercel (incluye `vercel.json`). El build genera artefactos estáticos en `dist/`.

## 6. Contacto y soporte
- Para soporte funcional: equipo de producto/operaciones.
- Para soporte técnico: revisar los tipos generados en `src/integrations/supabase/types.ts` y los flujos descritos arriba; cualquier cambio en la base de datos requiere regenerar tipos con `npx supabase gen types ...`.
