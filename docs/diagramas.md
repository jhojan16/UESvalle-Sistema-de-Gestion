# Diagramas - UES Valle

Referencias visuales para arquitectura y flujos clave. Los diagramas están en Mermaid; puedes visualizarlos en VS Code (extensión Mermaid) o en https://mermaid.live.

## 1) Arquitectura general
```mermaid
flowchart LR
  subgraph Cliente
    UI[React + Vite SPA]
    Router[React Router\nRutas públicas/privadas]
    Layout[Layout + Sidebar\nMUI + Shadcn]
    Pages[Pages:\nDashboard, Prestadores,\nMuestras, Inspección,\nMapa, Exportar, Subir]
    State[React Query\nCaché de datos]
  end

  subgraph Supabase
    Auth[Auth\nSesiones JWT]
    Postgrest[PostgREST\nTablas y vistas]
    Edge[Edge Functions\nexport_csv_full,\nmuestra_insert,\nsuper-handler,\nmapaRiesgo]
    Storage[Storage\nBucket imports]
    DB[(Postgres\nTablas: prestador,\ninspeccion, muestra,\nmapa_riesgo, anexos,\nstaging, etc.)]
  end

  UI --> Router --> Layout --> Pages --> State
  State --> Postgrest
  State --> Edge
  Edge --> Storage
  Postgrest --> DB
  Storage --> Edge
  UI --> Auth
  Auth --> Postgrest
```

## 2) Flujo de autenticación
```mermaid
sequenceDiagram
  participant U as Usuario
  participant SPA as React (Login page)
  participant Auth as Supabase Auth
  participant Router as ProtectedRoute

  U->>SPA: Ingresa correo/contraseña o registro
  SPA->>Auth: signIn / signUp
  Auth-->>SPA: session + user (JWT)
  SPA->>Router: guarda sesión (localStorage)
  Router->>SPA: permite rutas privadas si hay sesión
  U->>SPA: Navega módulo (dashboard, etc.)
```

## 3) Flujo de carga masiva
```mermaid
sequenceDiagram
  participant U as Usuario
  participant SPA as React (/subir)
  participant Storage as Supabase Storage (bucket imports)
  participant Edge as Edge Function (muestra_insert / super-handler / mapaRiesgo)
  participant DB as Postgres

  U->>SPA: Selecciona tipo y archivo CSV
  SPA->>Storage: upload file path tmp/<user>/<id>-file.csv
  SPA->>Edge: POST /functions/v1/<endpoint> { path }
  Edge->>Storage: lee CSV
  Edge->>DB: inserta datos (tablas finales o staging)
  Edge-->>SPA: mensaje de éxito/error
  SPA-->>U: muestra estado (toast/alerta)
```

## 4) Flujo de exportación CSV
```mermaid
sequenceDiagram
  participant U as Usuario
  participant SPA as React (/exportar)
  participant Edge as Edge Function (export_csv_full)
  participant DB as Postgres

  U->>SPA: Clic "Descargar CSV Completo" o "Ver vista previa"
  SPA->>Edge: invoke export_csv_full (preview=true opcional)
  Edge->>DB: consulta tablas/vistas
  Edge-->>SPA: CSV (completo o primeras filas)
  SPA-->>U: descarga archivo o muestra DataGrid
```

## 5) Flujo de resolución de duplicados (Inserción Individual)
```mermaid
flowchart LR
  Staging[inspeccion_staging\n registros duplicados por NIT]
  UI[UI InsercionIndividual\nDataGrid editable]
  Prest[prestador\n(catálogo por NIT)]
  Final[inspeccion\n(tabla final)]

  Staging --> UI
  Prest --> UI
  UI -->|asigna id_prestador\npor cada fila lista| Final
  UI -->|marca processed=true\ny elimina staging| Staging
```
