# 🌊 UES Valle - Sistema de Gestión

Sistema administrativo integral para la gestión de prestadores de servicios de acueducto y alcantarillado del Valle del Cauca. Proporciona herramientas para administrar inspecciones, muestras, laboratorios, técnicos y mapas de riesgo con interfaz moderna y responsiva.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuración](#configuración)
- [Uso](#uso)
- [Despliegue](#despliegue)

---

## ✨ Características

### Módulos Principales

- **Dashboard** - Panel de control con estadísticas y gráficos
- **Gestión de Prestadores** - CRUD de prestadores de servicios
- **Inspecciones Sanitarias** - Registro y seguimiento de inspecciones
- **Mapa de Riesgo** - Visualización geográfica de puntos de captación
- **Muestras y Muestreos** - Análisis de calidad de agua
- **Laboratorios** - Administración de laboratorios certificados
- **Técnicos** - Gestión del personal técnico
- **Solicitantes** - Registro de entidades solicitantes
- **Reportes** - Generación y exportación de reportes
- **Autenticación** - Sistema seguro de usuarios con Supabase

### Funcionalidades Destacadas

✅ Interfaz responsiva y moderna  
✅ Autenticación segura basada en roles  
✅ Visualización de datos en mapas interactivos  
✅ Gráficos y estadísticas en tiempo real  
✅ Exportación de datos a CSV y Excel  
✅ Búsqueda y filtrado avanzado  
✅ Validación de formularios robusta  

---

## 🛠️ Tecnologías Utilizadas

### Frontend

| Tecnología | Versión | Descripción |
|-----------|---------|------------|
| **React** | 18.3.1 | Librería UI |
| **TypeScript** | 5.8.3 | Tipado estático |
| **Vite** | 5.4.19 | Bundler y dev server |
| **Tailwind CSS** | 3.4.17 | Estilos utilitarios |
| **Material-UI (MUI)** | 7.3.6 | Componentes UI avanzados |
| **Shadcn/ui** | Latest | Componentes accesibles |

### Estado y API

| Librería | Versión | Uso |
|----------|---------|-----|
| **React Query** | 5.90.6 | Gestión de estado y caché |
| **Supabase JS** | 2.77.0 | Backend BaaS |
| **React Hook Form** | 7.61.1 | Gestión de formularios |
| **Zod** | 3.25.76 | Validación de esquemas |

### Mapas y Visualización

| Librería | Versión | Uso |
|----------|---------|-----|
| **Leaflet** | 1.9.4 | Mapas interactivos |
| **React Leaflet** | 4.2.1 | Integración React |
| **Recharts** | 2.15.4 | Gráficos y charts |

### Utilidades

- **React Router** 6.30.1 - Navegación SPA
- **Sonner** 1.7.4 - Notificaciones toast
- **date-fns** 3.6.0 - Manejo de fechas
- **file-saver** 2.0.5 - Descarga de archivos
- **xlsx** 0.18.5 - Generación de Excel
- **Emotion** 11.14.0 - CSS-in-JS

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** ≥ 18.x ([Descargar](https://nodejs.org/))
- **Bun** o **npm** (gestor de paquetes)
- **Git** para clonar el repositorio

Verifica las versiones:

```bash
node --version    # v18.x o superior
npm --version     # v8.x o superior
```

---

## 💻 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/usuario/UESvalle-Sistema-de-Gestion.git
cd UESvalle-Sistema-de-Gestion
```

### 2. Instalar Dependencias

**Con npm:**
```bash
npm install
```

**Con Bun:**
```bash
bun install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://kuxhhmcrhuqfnskjpyrh.supabase.co
VITE_SUPABASE_PROJECT_ID=kuxhhmcrhuqfnskjpyrh
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Nota:** Obtén estas variables de tu proyecto Supabase en el panel de administración.

### 4. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:8080**

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo con HMR

# Producción
npm run build            # Build optimizado para producción
npm run build:dev        # Build en modo desarrollo

# Herramientas
npm run lint             # Ejecuta ESLint
npm run preview          # Preview del build de producción
```

---

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes de Shadcn/ui
│   ├── AppSidebar.tsx   # Navegación lateral
│   ├── Layout.tsx       # Layout principal
│   └── ProtectedRoute.tsx # Rutas protegidas
│
├── pages/               # Páginas principales
│   ├── Dashboard.tsx    # Panel de control
│   ├── Prestadores.tsx  # Gestión de prestadores
│   ├── Inspeccion.tsx   # Inspecciones sanitarias
│   ├── MapaRiesgo.tsx   # Mapa de riesgo geográfico
│   ├── Muestras.tsx     # Análisis de muestras
│   ├── Laboratorio.tsx  # Gestión de laboratorios
│   ├── Tecnico.tsx      # Registro técnico
│   ├── Solicitantes.tsx # Gestión de solicitantes
│   ├── Reportes.tsx     # Reportes y estadísticas
│   └── Login.tsx        # Autenticación
│
├── contexts/            # Context API
│   └── AuthContext.tsx  # Contexto de autenticación
│
├── hooks/               # Hooks personalizados
│   ├── use-toast.ts
│   └── use-mobile.tsx
│
├── integrations/        # Integraciones externas
│   └── supabase/
│       ├── client.ts    # Cliente Supabase
│       └── types.ts     # Tipos Supabase
│
├── lib/                 # Utilidades
│   └── utils.ts
│
├── theme/               # Temas Material-UI
│   └── muiTheme.ts
│
├── App.tsx              # Componente principal
└── index.css            # Estilos globales
```

---

## ⚙️ Configuración

### Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Copia las credenciales a `.env`
3. Ejecuta las migraciones:

```bash
supabase migration up
```

### Tailwind CSS

Configuración en `tailwind.config.ts`:
- Variables de color institucionales (azul y verde)
- Sistema de diseño completo
- Extensiones personalizadas

### Material-UI

Tema personalizado en `theme/muiTheme.ts`:
- Paleta de colores institucional
- Tipografía personalizada
- Componentes con estilos propios

---

## 🚀 Uso

### Flujo de Autenticación

1. Accede a `/login`
2. Inicia sesión o crea nueva cuenta
3. Serás redirigido al Dashboard

### Módulos Principales

#### Dashboard
- Estadísticas generales
- Gráficos de distribución
- Visualización de ubicaciones

#### Prestadores
- Crear/editar/eliminar prestadores
- Ver detalles completos
- Acceso a muestras e inspecciones relacionadas

#### Mapa de Riesgo
- Visualización interactiva de Leaflet
- Panel lateral con detalles
- Información de características y resoluciones

#### Reportes
- Gráficos por estado
- Filtrado dinámico
- Exportación de datos

### Búsqueda y Filtrado

Todos los módulos incluyen:
- Búsqueda por texto en tiempo real
- Paginación (25 filas por página)
- Filtrado avanzado
- Ordenamiento

---

## 📦 Despliegue

### Vercel (Recomendado)

El proyecto está configurado para Vercel:

```bash
# Conexiona tu repositorio en Vercel
# Las variables de entorno se configuran en el panel
# Vercel desplegará automáticamente en cada push
```

### Configuración de Variables

En el panel de Vercel, añade:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PROJECT_ID=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

### Build Manual

```bash
npm run build
# Los archivos estáticos estarán en ./dist
```

---

## 🔐 Seguridad

- ✅ Autenticación con Supabase Auth
- ✅ Rutas protegidas con verificación de sesión
- ✅ Validación de formularios con Zod
- ✅ Variables sensibles en `.env` (no versionadas)
- ✅ CORS configurado en Supabase

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es privado. Todos los derechos reservados.

---

## 📞 Contacto

Para preguntas o soporte, contacta a:
- **Email:** [jespinosam116gmail.com]
- **Documentación:** Consulta los comentarios en el código

---

## 🔄 Versionado

- **Versión Actual:** 0.0.0 (Desarrollo)
- **Última Actualización:** Diciembre 2025
- **Node.js:** 18.x o superior
- **npm:** 8.x o superior

---

## 📚 Recursos Útiles

- [Documentación React](https://react.dev)
- [Documentación Vite](https://vitejs.dev)
- [Documentación Supabase](https://supabase.com/docs)
- [Documentación Tailwind](https://tailwindcss.com/docs)
- [Documentación Material-UI](https://mui.com/material-ui/getting-started/)
- [Documentación React Query](https://tanstack.com/query/latest)


