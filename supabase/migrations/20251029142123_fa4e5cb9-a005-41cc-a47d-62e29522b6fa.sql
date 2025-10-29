-- Crear tabla de ubicaciones base
CREATE TABLE public.ubicacion (
  id_ubicacion BIGSERIAL PRIMARY KEY,
  departamento TEXT NOT NULL,
  municipio TEXT NOT NULL,
  vereda TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de ubicación de laboratorio
CREATE TABLE public.ubicacion_laboratorio (
  id_ubicacion_lab BIGSERIAL PRIMARY KEY,
  departamento TEXT NOT NULL,
  municipio TEXT NOT NULL,
  direccion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de ubicación de solicitante
CREATE TABLE public.ubicacion_solicitante (
  id_ubicacion_sol BIGSERIAL PRIMARY KEY,
  departamento TEXT NOT NULL,
  municipio TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de ubicación de técnico
CREATE TABLE public.ubicacion_tecnico (
  id_ubicacion_tec BIGSERIAL PRIMARY KEY,
  departamento TEXT NOT NULL,
  municipio TEXT NOT NULL,
  direccion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de laboratorios
CREATE TABLE public.laboratorio (
  id_laboratorio BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  estado TEXT DEFAULT 'activo',
  telefono TEXT,
  email TEXT,
  id_ubicacion_lab BIGINT REFERENCES public.ubicacion_laboratorio(id_ubicacion_lab),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de prestadores
CREATE TABLE public.prestador (
  id_prestador BIGSERIAL PRIMARY KEY,
  nit TEXT,
  id_sspd TEXT,
  id_autoridad_sanitaria TEXT,
  nombre TEXT NOT NULL,
  direccion TEXT,
  telefono TEXT,
  id_ubicacion BIGINT REFERENCES public.ubicacion(id_ubicacion),
  codigo_sistema INTEGER,
  codigo_anterior INTEGER,
  nombre_sistema TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de representantes
CREATE TABLE public.representante (
  id_representante BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  cargo TEXT,
  email TEXT,
  id_prestador BIGINT REFERENCES public.prestador(id_prestador) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de solicitantes
CREATE TABLE public.solicitante (
  id_solicitante BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  estado TEXT DEFAULT 'activo',
  id_ubicacion_sol BIGINT REFERENCES public.ubicacion_solicitante(id_ubicacion_sol),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de técnicos
CREATE TABLE public.tecnico (
  id_tecnico BIGSERIAL PRIMARY KEY,
  identificacion BIGINT,
  nombre TEXT NOT NULL,
  telefono TEXT,
  profesion TEXT,
  email TEXT,
  id_ubicacion_tec BIGINT REFERENCES public.ubicacion_tecnico(id_ubicacion_tec),
  id_laboratorio BIGINT REFERENCES public.laboratorio(id_laboratorio),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de fuentes
CREATE TABLE public.fuente (
  id_fuente BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  clase TEXT,
  tipo TEXT,
  id_ubicacion BIGINT REFERENCES public.ubicacion(id_ubicacion),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de muestreos
CREATE TABLE public.muestreo (
  id_muestreo BIGSERIAL PRIMARY KEY,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  id_prestador BIGINT REFERENCES public.prestador(id_prestador) ON DELETE CASCADE,
  id_laboratorio BIGINT REFERENCES public.laboratorio(id_laboratorio),
  id_solicitante BIGINT REFERENCES public.solicitante(id_solicitante),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de reportes
CREATE TABLE public.reportes (
  id BIGSERIAL PRIMARY KEY,
  codigo TEXT NOT NULL,
  prestador TEXT,
  punto TEXT,
  departamento TEXT,
  municipio TEXT,
  fecha_creacion TEXT,
  estado TEXT DEFAULT 'pendiente',
  enlace_informe TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  email TEXT,
  rol TEXT DEFAULT 'usuario',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Habilitar Row Level Security en todas las tablas
ALTER TABLE public.ubicacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubicacion_laboratorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubicacion_solicitante ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubicacion_tecnico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prestador ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.representante ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitante ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tecnico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muestreo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuarios autenticados (lectura para todos, escritura restringida)

-- Políticas para ubicaciones
CREATE POLICY "Usuarios autenticados pueden ver ubicaciones"
ON public.ubicacion FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear ubicaciones"
ON public.ubicacion FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar ubicaciones"
ON public.ubicacion FOR UPDATE
TO authenticated
USING (true);

-- Políticas para ubicacion_laboratorio
CREATE POLICY "Usuarios autenticados pueden ver ubicaciones de laboratorio"
ON public.ubicacion_laboratorio FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear ubicaciones de laboratorio"
ON public.ubicacion_laboratorio FOR INSERT
TO authenticated
WITH CHECK (true);

-- Políticas para ubicacion_solicitante
CREATE POLICY "Usuarios autenticados pueden ver ubicaciones de solicitante"
ON public.ubicacion_solicitante FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear ubicaciones de solicitante"
ON public.ubicacion_solicitante FOR INSERT
TO authenticated
WITH CHECK (true);

-- Políticas para ubicacion_tecnico
CREATE POLICY "Usuarios autenticados pueden ver ubicaciones de técnico"
ON public.ubicacion_tecnico FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear ubicaciones de técnico"
ON public.ubicacion_tecnico FOR INSERT
TO authenticated
WITH CHECK (true);

-- Políticas para laboratorio
CREATE POLICY "Usuarios autenticados pueden ver laboratorios"
ON public.laboratorio FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear laboratorios"
ON public.laboratorio FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar laboratorios"
ON public.laboratorio FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar laboratorios"
ON public.laboratorio FOR DELETE
TO authenticated
USING (true);

-- Políticas para prestador
CREATE POLICY "Usuarios autenticados pueden ver prestadores"
ON public.prestador FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear prestadores"
ON public.prestador FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar prestadores"
ON public.prestador FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar prestadores"
ON public.prestador FOR DELETE
TO authenticated
USING (true);

-- Políticas para representante
CREATE POLICY "Usuarios autenticados pueden ver representantes"
ON public.representante FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear representantes"
ON public.representante FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar representantes"
ON public.representante FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar representantes"
ON public.representante FOR DELETE
TO authenticated
USING (true);

-- Políticas para solicitante
CREATE POLICY "Usuarios autenticados pueden ver solicitantes"
ON public.solicitante FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear solicitantes"
ON public.solicitante FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar solicitantes"
ON public.solicitante FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar solicitantes"
ON public.solicitante FOR DELETE
TO authenticated
USING (true);

-- Políticas para tecnico
CREATE POLICY "Usuarios autenticados pueden ver técnicos"
ON public.tecnico FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear técnicos"
ON public.tecnico FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar técnicos"
ON public.tecnico FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar técnicos"
ON public.tecnico FOR DELETE
TO authenticated
USING (true);

-- Políticas para fuente
CREATE POLICY "Usuarios autenticados pueden ver fuentes"
ON public.fuente FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear fuentes"
ON public.fuente FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar fuentes"
ON public.fuente FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar fuentes"
ON public.fuente FOR DELETE
TO authenticated
USING (true);

-- Políticas para muestreo
CREATE POLICY "Usuarios autenticados pueden ver muestreos"
ON public.muestreo FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear muestreos"
ON public.muestreo FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar muestreos"
ON public.muestreo FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar muestreos"
ON public.muestreo FOR DELETE
TO authenticated
USING (true);

-- Políticas para reportes
CREATE POLICY "Usuarios autenticados pueden ver reportes"
ON public.reportes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear reportes"
ON public.reportes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar reportes"
ON public.reportes FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar reportes"
ON public.reportes FOR DELETE
TO authenticated
USING (true);

-- Políticas para profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_prestador_nombre ON public.prestador(nombre);
CREATE INDEX idx_prestador_ubicacion ON public.prestador(id_ubicacion);
CREATE INDEX idx_muestreo_prestador ON public.muestreo(id_prestador);
CREATE INDEX idx_representante_prestador ON public.representante(id_prestador);
CREATE INDEX idx_tecnico_laboratorio ON public.tecnico(id_laboratorio);
CREATE INDEX idx_reportes_estado ON public.reportes(estado);