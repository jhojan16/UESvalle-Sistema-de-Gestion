# Diagramas - UES Valle

Diagramas en Mermaid para arquitectura, navegacion y flujos operativos.

> Puedes visualizarlos en VS Code (extension Mermaid) o en https://mermaid.live

---

## 1) Arquitectura general

```mermaid
flowchart LR
  subgraph Frontend[Frontend SPA]
    A[React + TypeScript]
    B[React Router]
    C[ProtectedRoute]
    D[Layout + Sidebar]
    E[Paginas de negocio]
    F[React Query]
  end

  subgraph Supabase[Supabase]
    G[Auth]
    H[PostgREST]
    I[Functions]
    J[Storage bucket imports]
    K[(Postgres)]
  end

  A --> B --> C --> D --> E --> F
  F --> H --> K
  E --> G
  E --> I
  E --> J
  I --> J
  I --> K
```

---

## 2) Mapa de rutas

```mermaid
flowchart TD
  R0[/] --> R1[/login]

  R1 --> R2[/dashboard]
  R2 --> R3[/prestadores]
  R3 --> R4[/prestadores/:id]

  R2 --> R5[/tecnicos]
  R2 --> R6[/solicitantes]
  R2 --> R7[/muestras]
  R2 --> R8[/inspeccion]
  R8 --> R9[/inspeccion/InsercionIndividual]
  R2 --> R10[/mapa]
  R2 --> R11[/exportar]
  R2 --> R12[/subir]

  R2 --> R404[*]
```

---

## 3) Flujo de autenticacion

```mermaid
sequenceDiagram
  participant U as Usuario
  participant UI as Login
  participant AUTH as Supabase Auth
  participant CTX as AuthContext
  participant ROUTE as ProtectedRoute

  U->>UI: Envia credenciales
  UI->>AUTH: signIn/signUp
  AUTH-->>CTX: session + user
  CTX-->>UI: estado autenticado
  UI->>ROUTE: navegar a ruta privada
  ROUTE-->>UI: permite render si user existe
```

---

## 4) Flujo CRUD de prestadores

```mermaid
sequenceDiagram
  participant U as Usuario
  participant UI as Prestadores
  participant DB as Supabase DB
  participant Q as React Query

  U->>UI: Crear prestador
  UI->>DB: insert ubicacion
  UI->>DB: insert prestador (id_ubicacion)
  DB-->>UI: OK
  UI->>Q: invalidateQueries(prestadores)
  Q-->>UI: recarga tabla

  U->>UI: Editar prestador
  UI->>DB: update ubicacion
  UI->>DB: update prestador
  DB-->>UI: OK

  U->>UI: Eliminar prestador
  UI->>DB: delete prestador
  UI->>DB: delete ubicacion asociada
  DB-->>UI: OK
```

---

## 5) Flujo de carga masiva CSV

```mermaid
sequenceDiagram
  participant U as Usuario
  participant UI as VistaUpload
  participant S as Storage imports
  participant F as Edge Function
  participant DB as Postgres

  U->>UI: Selecciona tipo y archivo CSV
  UI->>S: upload tmp/<user>/<id>-archivo.csv
  UI->>F: POST path del archivo
  F->>S: lee archivo
  F->>DB: procesa e inserta datos
  F-->>UI: respuesta de estado
  UI-->>U: mensaje de exito/error
```

---

## 6) Flujo de exportacion

```mermaid
sequenceDiagram
  participant U as Usuario
  participant UI as VistaExportar
  participant F as Function export_csv_full
  participant DB as Postgres

  U->>UI: Selecciona tipo
  U->>UI: Cargar vista previa o descargar
  UI->>F: POST {tipo, preview}
  F->>DB: consulta dataset
  F-->>UI: contenido CSV
  UI-->>U: DataGrid preview o archivo descargado
```

---

## 7) Flujo de resolucion de duplicados (inspeccion staging)

```mermaid
flowchart LR
  A[inspeccion_staging_nits_duplicados] --> B[UI InsercionIndividual]
  C[prestador] --> B

  B --> D{Fila lista?}
  D -- No --> E[Permanece pendiente]
  D -- Si --> F[Insert en inspeccion]
  F --> G[Update processed=true en staging]
  G --> H[Delete filas staging procesadas]
```

---

## 8) Flujo de consulta en mapa de riesgo

```mermaid
flowchart TD
  A[MapaRiesgo.tsx] --> B[Consulta mapa_riesgo con relaciones]
  B --> C[Render de marcadores Leaflet]
  C --> D[Click en marcador]
  D --> E[Panel de detalle]
  E --> F[Prestador]
  E --> G[Punto de captacion]
  E --> H[Anexos y anexos2]
  E --> I[Seguimiento, riesgo, seguridad]
```
