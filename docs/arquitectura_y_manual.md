# UES Valle - Arquitectura y Manual de Usuario

Documento tecnico-funcional para entrega a cliente.

## Control del documento

- Proyecto: UES Valle - Sistema de Gestion
- Tipo: Arquitectura + Manual de usuario
- Estado: Actualizado para entrega
- Fecha de actualizacion: 2026-02-23
- Fuente principal: Codigo del repositorio

---

## 1. Objetivo y alcance

Este documento describe:

1. Arquitectura tecnica del sistema frontend.
2. Integracion con backend en Supabase.
3. Modulos funcionales disponibles para usuario final.
4. Procedimientos operativos de uso diario.
5. Consideraciones para soporte, despliegue y continuidad.

El alcance cubre exclusivamente la aplicacion de este repositorio.

---

## 2. Vista general del sistema

### 2.1 Tipo de aplicacion

- SPA (Single Page Application) con React y TypeScript.
- Navegacion por rutas con control de acceso por sesion.
- Consumo directo de datos y funciones remotas en Supabase.

### 2.2 Objetivo de negocio

Centralizar la gestion de informacion de:

- Prestadores
- Muestras
- Inspecciones sanitarias
- Mapas de riesgo
- Tecnicos
- Solicitantes

Incluye procesos transversales de carga masiva y exportacion CSV.

### 2.3 Flujo macro

1. Usuario inicia sesion.
2. Sistema valida sesion y habilita rutas privadas.
3. Usuario opera modulos CRUD/consulta.
4. Para lotes, usa carga masiva por CSV.
5. Para salida de informacion, usa exportacion CSV.

---

## 3. Arquitectura tecnica

### 3.1 Frontend

Base tecnologica:

- React 18
- TypeScript
- Vite
- MUI + Tailwind + componentes UI
- TanStack React Query
- React Router
- DataGrid (MUI X)
- React Leaflet
- Recharts

Estructura principal:

- `src/main.tsx`: inicializa aplicacion y tema.
- `src/App.tsx`: define rutas y providers globales.
- `src/components/Layout.tsx`: layout base (sidebar + contenido).
- `src/components/AppSidebar.tsx`: menu lateral y cierre de sesion.

### 3.2 Enrutamiento y proteccion

Rutas publicas:

- `/login`

Rutas privadas:

- `/dashboard`
- `/prestadores`
- `/prestadores/:id`
- `/tecnicos`
- `/solicitantes`
- `/muestras`
- `/inspeccion`
- `/inspeccion/InsercionIndividual`
- `/mapa`
- `/exportar`
- `/Subir` (accesible tambien por `/subir`)

Control de acceso:

- `ProtectedRoute` redirige a login cuando no existe usuario autenticado.

### 3.3 Sesion y autenticacion

`src/contexts/AuthContext.tsx` implementa:

- Escucha de estado de autenticacion.
- Recuperacion de sesion persistida.
- `signIn`, `signUp`, `signOut`.
- Redireccion a dashboard despues de login/registro.

### 3.4 Manejo de estado de datos

Cada modulo usa React Query para:

- Consultas paginadas.
- Busquedas.
- Mutaciones CRUD.
- Invalidez de cache tras cambios.
- Indicadores de carga y manejo de error.

### 3.5 Estilos y diseno

- Tema MUI definido en `src/theme/muiTheme.ts`.
- Variables de diseno en `src/index.css`.
- Sidebar institucional con comportamiento expandir/contraer.

---

## 4. Integracion con Supabase

### 4.1 Cliente

`src/integrations/supabase/client.ts` crea el cliente con:

- Persistencia de sesion en navegador.
- Auto refresh de token.

### 4.2 Tipos

- `src/integrations/supabase/types.ts`: tipos generados desde base de datos.
- `src/integrations/supabase/index.ts`: tipos compuestos para joins usados en UI.

### 4.3 Dominios de datos relevantes

Catalogos y maestros:

- `prestador`
- `ubicacion`
- `laboratorio`
- `tecnico`
- `solicitante`
- `representante`

Operacion de calidad y control:

- `muestra`
- `analisis_muestra`
- `punto_muestreo`
- `inspeccion`

Mapa de riesgo y relaciones tecnicas:

- `mapa_riesgo`
- `punto_captacion`
- `anexo`
- `anexo2`
- `entidad_participante`
- `caracteristica_priorizada`
- `documento_fuente`
- `bocatoma`
- `red`
- `resolucion`
- `seguimiento`
- `riesgo`
- `seguridad`
- `seguimiento_inspeccion`
- `seguimiento_caracteristica`

Staging y soporte de carga:

- `inspeccion_staging`
- `muestra_staging`
- `mapa_riesgo_staging`
- vista `inspeccion_staging_nits_duplicados`

### 4.4 Funciones y RPC consumidas por UI

Dashboard:

- `dashboard_irca_por_municipio`
- `dashboard_prestadores_por_departamento`
- `dashboard_top_municipios`

Carga masiva y exportacion:

- Edge function `muestra_insert`
- Edge function `super-handler`
- Edge function `mapaRiesgo`
- Edge function `export_csv_full`

### 4.5 Storage

- Bucket usado: `imports`
- Ruta de carga por usuario: `tmp/<usuario>/<id>-<archivo>.csv`

---

## 5. Seguridad y gobierno de datos

1. Todo modulo de negocio requiere sesion activa.
2. Credenciales sensibles no se documentan en este archivo.
3. Sesion se gestiona por token y persistencia de cliente Supabase.
4. Flujos de carga/exportacion requieren token valido.
5. Eliminaciones en CRUD muestran confirmacion previa en UI.

---

## 6. Modulos funcionales (detalle)

### 6.1 Login (`/login`)

- Tabs: iniciar sesion y registro.
- Registro solicita nombre, correo y clave.
- En exito redirige a dashboard.

### 6.2 Dashboard (`/dashboard`)

- Tarjetas con conteos: prestadores, muestras, mapa de riesgo, inspecciones.
- Grafico por departamento (pie chart).
- Top municipios (pie chart).
- Promedio IRCA por municipio (bar chart horizontal con color por nivel).

### 6.3 Prestadores (`/prestadores`)

- CRUD completo.
- Alta: crea `ubicacion` y luego `prestador`.
- Edicion: actualiza ubicacion y datos del prestador.
- Eliminacion: elimina prestador y su ubicacion asociada.
- Busqueda por nombre o NIT.
- Acceso a detalle por fila.

### 6.4 Detalle de prestador (`/prestadores/:id`)

- Informacion general.
- Representante.
- Ubicacion.
- Indicadores de poblacion.
- Mapa de puntos de captacion (Leaflet).
- Tabs:
  - Inspecciones
  - Muestras
  - Mapas de riesgo
- En mapa de riesgo muestra tablas de bocatoma y red cuando existen.

### 6.5 Tecnicos (`/tecnicos`)

- CRUD tecnico.
- Formulario con selectores de laboratorio y ubicacion.
- Busqueda por nombre/profesion.
- Confirmacion formal en eliminacion.

### 6.6 Solicitantes (`/solicitantes`)

- CRUD solicitante.
- Selector obligatorio de ubicacion_solicitante.
- Busqueda por nombre o estado.

### 6.7 Muestras (`/muestras`)

- Listado paginado en DataGrid.
- Filtros exactos por: numero de muestra, NIT, fecha.
- Modal de detalle con secciones:
  - Informacion general
  - Resultados de laboratorio por parametro
  - Punto de muestreo
  - Prestador
  - Laboratorio

### 6.8 Inspeccion sanitaria (`/inspeccion`)

- Vista tipo tarjetas.
- Filtro exacto por:
  - ID SIVICAP
  - Fecha inspeccion
  - NIT prestador
  - Nombre prestador
- Modal de detalle con datos tecnicos e informacion de prestador.
- Acceso a flujo de resolucion de staging.

### 6.9 Resolver duplicados (`/inspeccion/InsercionIndividual`)

- Lista NIT duplicados desde vista `inspeccion_staging_nits_duplicados`.
- Permite asignar `id_prestador` fila a fila.
- Boton enviar:
  1. Inserta en `inspeccion` las filas listas.
  2. Marca staging como procesado.
  3. Elimina staging procesado.
- Soporta eliminacion puntual de filas en staging.

### 6.10 Mapa de riesgo (`/mapa`)

- Mapa interactivo con marcadores.
- Busqueda por ID mapa, nombre/NIT de prestador o municipio.
- Panel lateral con detalle completo:
  - Prestador
  - Punto de captacion
  - Anexos
  - Anexos 2
  - Bocatoma
  - Red
  - Resolucion
  - Seguimiento, riesgo, seguridad

### 6.11 Exportar (`/exportar`)

- Seleccion de tipo de exportacion: muestra, inspeccion, mapa_riesgo.
- Cargar vista previa (primeras filas).
- Descargar CSV consolidado.

### 6.12 Subir (`/subir`)

- Seleccion de tipo de carga: muestra, inspeccion, mapa_riesgo.
- Descarga de plantilla oficial.
- Carga a Storage y ejecucion de function remota.
- Mensajes de estado para exito/error.

---

## 7. Manual operativo para usuario final

### 7.1 Inicio de sesion

1. Abrir `/login`.
2. Ingresar correo y clave.
3. Presionar iniciar sesion.
4. Verificar redireccion a dashboard.

### 7.2 Registro de cuenta

1. En login, abrir tab registrarse.
2. Diligenciar nombre, correo y clave.
3. Crear cuenta.
4. Confirmar ingreso al sistema.

### 7.3 Operar Prestadores

1. Ir a menu `Prestadores`.
2. Buscar por nombre/NIT o crear nuevo.
3. Para crear: diligenciar datos y ubicacion.
4. Para editar: usar accion editar en la tabla.
5. Para detalle: usar accion ver.
6. Para eliminar: confirmar accion.

### 7.4 Operar Muestras

1. Ir a `Muestras`.
2. Elegir filtro y valor exacto.
3. Ejecutar busqueda.
4. Abrir detalle con icono de visualizacion.
5. Revisar secciones de analisis y metadatos.

### 7.5 Operar Inspecciones

1. Ir a `Inspeccion sanitaria`.
2. Seleccionar tipo de filtro.
3. Aplicar busqueda o usar paginacion por defecto.
4. Abrir tarjeta para ver detalle.
5. Si hay duplicados pendientes, entrar a `Completar inspecciones sin NIT`.

### 7.6 Resolver duplicados de staging

1. Seleccionar NIT duplicado.
2. Asignar prestador para cada fila.
3. Validar filas listas y pendientes.
4. Presionar `Enviar` para consolidar en tabla final.

### 7.7 Operar Mapa de riesgo

1. Ir a `Mapa de riesgo`.
2. Buscar registro o elegir marcador en mapa.
3. Revisar detalle tecnico en panel lateral.
4. Expandir secciones de anexos y seguimiento.

### 7.8 Carga masiva

1. Ir a `Subir`.
2. Elegir tipo de carga.
3. Descargar plantilla correspondiente.
4. Completar CSV segun formato.
5. Subir archivo y esperar respuesta.
6. Validar resultado mostrado por la plataforma.

### 7.9 Exportar datos

1. Ir a `Exportar`.
2. Elegir tipo de exportacion.
3. Opcional: cargar vista previa.
4. Descargar archivo CSV.

### 7.10 Cerrar sesion

- Usar accion `Cerrar Sesion` al final del sidebar.

---

## 8. Operacion tecnica y despliegue

### 8.1 Comandos operativos

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

### 8.2 Despliegue

- SPA preparada para Vercel (`vercel.json` con rewrite global a `index.html`).
- Validar rutas privadas despues del despliegue.

### 8.3 Consideraciones de configuracion

- Mantener archivo de entorno fuera de control de versiones.
- Alinear configuracion de despliegue con el proyecto Supabase de destino.

---

## 9. Runbook de soporte

### 9.1 Falla de autenticacion

1. Verificar credenciales de usuario.
2. Confirmar estado de sesion.
3. Cerrar sesion y reingresar.

### 9.2 Error en carga masiva

1. Revisar formato CSV y plantilla usada.
2. Verificar que exista sesion valida.
3. Revisar respuesta de function remota en mensaje de error.

### 9.3 Exportacion vacia o fallida

1. Confirmar tipo de exportacion seleccionado.
2. Probar vista previa para validar datos.
3. Reintentar descarga con sesion activa.

### 9.4 No carga mapa o marcadores

1. Validar datos de latitud/longitud en registros.
2. Verificar que existan relaciones con punto_captacion.

---

## 10. Checklist de aceptacion funcional

### 10.1 Seguridad

- Login y logout funcional.
- Rutas privadas protegidas.
- Sin exposicion de secretos en documentacion.

### 10.2 Operacion base

- CRUD de prestadores.
- CRUD de tecnicos.
- CRUD de solicitantes.
- Consulta de muestras.
- Consulta de inspecciones.

### 10.3 Procesos avanzados

- Resolucion de staging en inspecciones.
- Carga masiva de CSV en 3 dominios.
- Exportacion CSV por tipo.
- Navegacion de mapa de riesgo y detalle tecnico.

---

## 11. Consideraciones y alcance de version

1. Existen paginas tecnicas (`Laboratorio`, `Reportes`) presentes en codigo pero no expuestas en rutas activas del menu principal.
2. `Index.tsx` es pagina plantilla y no forma parte del flujo normal.
3. El esquema SQL en `supabase/migrations` se usa como referencia documental.

---

## 12. Anexos

- Diagramas: `docs/diagramas.md`
- Estructura: `docs/estructura_carpetas.txt`
- Manual TXT: `docs/manual_cliente.txt`
- Imagenes: `docs/imagenes_proyecto.txt`
