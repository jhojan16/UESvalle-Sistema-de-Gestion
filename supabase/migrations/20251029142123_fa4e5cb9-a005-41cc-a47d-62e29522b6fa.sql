-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.analisis_muestra (
  id_analisis_muestra bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  tipo_analisis character varying,
  caracteristica character varying,
  metodo character varying,
  resultado character varying,
  unidades character varying,
  valores_aceptados character varying,
  diagnostico character varying,
  id_muestra bigint NOT NULL,
  CONSTRAINT analisis_muestra_pkey PRIMARY KEY (id_analisis_muestra),
  CONSTRAINT analisis_muestra_id_muestra_fkey FOREIGN KEY (id_muestra) REFERENCES public.muestra(id_muestra)
);
CREATE TABLE public.anexo (
  id_reporte1 bigint NOT NULL DEFAULT nextval('anexo_id_reporte1_seq'::regclass),
  inspeccion_ocular character varying,
  tipo_inspeccion_ocular character varying,
  fecha_inspeccion_ocular character varying,
  fecha_entidades character varying,
  departamento character varying,
  municipio character varying,
  vereda character varying,
  autoridad_sanitaria character varying,
  id_mapa bigint,
  fecha_reunion_entidades character varying,
  CONSTRAINT anexo_pkey PRIMARY KEY (id_reporte1),
  CONSTRAINT anexo_id_mapa_fkey FOREIGN KEY (id_mapa) REFERENCES public.mapa_riesgo(id_mapa)
);
CREATE TABLE public.anexo2 (
  id_reporte2 bigint NOT NULL DEFAULT nextval('anexo2_id_reporte_seq'::regclass),
  consecutivo_mapa_riesgo character varying,
  anterior_mapa_riesgo character varying,
  id_mapa bigint,
  CONSTRAINT anexo2_pkey PRIMARY KEY (id_reporte2),
  CONSTRAINT anexo2_id_mapa_fkey FOREIGN KEY (id_mapa) REFERENCES public.mapa_riesgo(id_mapa)
);
CREATE TABLE public.bocatoma (
  id_bocatoma bigint NOT NULL DEFAULT nextval('bocatoma_id_bocatoma_seq'::regclass),
  fecha character varying,
  caract_fisica character varying,
  caract_quimica character varying,
  caract_microbiologicas character varying,
  caract_especiales character varying,
  descartadas character varying,
  id_reporte2 bigint,
  CONSTRAINT bocatoma_pkey PRIMARY KEY (id_bocatoma),
  CONSTRAINT bocatoma_id_reporte2_fkey FOREIGN KEY (id_reporte2) REFERENCES public.anexo2(id_reporte2)
);
CREATE TABLE public.caracteristica_priorizada (
  id_caracteristica bigint NOT NULL DEFAULT nextval('caracteristica_priorizada_id_caracteristica_seq'::regclass),
  actividad_contaminante character varying,
  carac_fisica character varying,
  carac_quimica character varying,
  carac_microbiologica character varying,
  carac_especial character varying,
  observaciones text,
  id_reporte1 bigint,
  CONSTRAINT caracteristica_priorizada_pkey PRIMARY KEY (id_caracteristica),
  CONSTRAINT caracteristica_priorizada_id_reporte1_fkey FOREIGN KEY (id_reporte1) REFERENCES public.anexo(id_reporte1)
);
CREATE TABLE public.documento_fuente (
  id_documento bigint NOT NULL DEFAULT nextval('documento_fuente_id_documento_seq'::regclass),
  fuente_info character varying,
  nombre_documento character varying,
  tipo_documento character varying,
  autor character varying,
  fecha_publicacion character varying,
  id_reporte1 bigint,
  CONSTRAINT documento_fuente_pkey PRIMARY KEY (id_documento),
  CONSTRAINT documento_fuente_id_reporte1_fkey FOREIGN KEY (id_reporte1) REFERENCES public.anexo(id_reporte1)
);
CREATE TABLE public.entidad_participante (
  id_entidad bigint NOT NULL DEFAULT nextval('entidad_participante_id_entidad_seq'::regclass),
  entidad character varying,
  dependencia character varying,
  cargo character varying,
  id_reporte1 bigint,
  CONSTRAINT entidad_participante_pkey PRIMARY KEY (id_entidad),
  CONSTRAINT entidad_participante_id_reporte1_fkey FOREIGN KEY (id_reporte1) REFERENCES public.anexo(id_reporte1)
);
CREATE TABLE public.fuente (
  id_fuente bigint NOT NULL DEFAULT nextval('fuente_id_fuente_seq'::regclass),
  nombre text NOT NULL,
  clase text,
  tipo text,
  id_ubicacion bigint,
  CONSTRAINT fuente_pkey PRIMARY KEY (id_fuente),
  CONSTRAINT fuente_id_ubicacion_fkey FOREIGN KEY (id_ubicacion) REFERENCES public.ubicacion(id_ubicacion)
);
CREATE TABLE public.inspeccion (
  id_inspeccion bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_inspeccion_sivicap bigint,
  fecha_inspeccion character varying,
  autoridad_inspeccion character varying,
  fecha_visita_anterior character varying,
  nombre_visita_anterior character varying,
  copia_visita_anterior character varying,
  concepto character varying,
  plazo_ejecucion_inspeccion character varying,
  plan_mejoramiento character varying,
  habitantes_municipio integer,
  viviendas integer,
  viviendas_urbano integer,
  iraba_inspeccion integer,
  indice_tratamiento integer,
  indice_continuidad integer,
  bps integer,
  estado character varying,
  id_prestador bigint,
  CONSTRAINT inspeccion_pkey PRIMARY KEY (id_inspeccion),
  CONSTRAINT inspeccion_id_prestador_fkey FOREIGN KEY (id_prestador) REFERENCES public.prestador(id_prestador)
);
CREATE TABLE public.inspeccion_staging (
  id_inspeccion_sivicap text,
  fecha_inspeccion text,
  autoridad_inspeccion text,
  fecha_visita_anterior text,
  nombre_visita_anterior text,
  copia_visita_anterior text,
  concepto text,
  plazo_ejecucion_inspeccion text,
  plan_mejoramiento text,
  habitantes_municipio text,
  viviendas text,
  viviendas_urbano text,
  iraba_inspeccion text,
  indice_tratamiento text,
  indice_continuidad text,
  bps text,
  estado text,
  nit text,
  processed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.laboratorio (
  id_laboratorio bigint NOT NULL DEFAULT nextval('laboratorio_id_laboratorio_seq'::regclass),
  nombre text NOT NULL,
  estado text DEFAULT 'activo'::text,
  telefono text,
  email text,
  id_ubicacion_lab bigint,
  CONSTRAINT laboratorio_pkey PRIMARY KEY (id_laboratorio),
  CONSTRAINT laboratorio_id_ubicacion_lab_fkey FOREIGN KEY (id_ubicacion_lab) REFERENCES public.ubicacion_laboratorio(id_ubicacion_lab)
);
CREATE TABLE public.mapa_riesgo (
  id_mapa bigint NOT NULL,
  id_prestador bigint,
  id_punto_captacion bigint,
  CONSTRAINT mapa_riesgo_pkey PRIMARY KEY (id_mapa),
  CONSTRAINT mapa_riesgo_id_punto_captacion_fkey FOREIGN KEY (id_punto_captacion) REFERENCES public.punto_captacion(id_punto_captacion),
  CONSTRAINT mapa_riesgo_id_prestador_fkey FOREIGN KEY (id_prestador) REFERENCES public.prestador(id_prestador)
);
CREATE TABLE public.mapa_riesgo_staging (
  id_staging bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nit text,
  id_mapa text,
  tipo_captacion text,
  fuente_captacion text,
  georeferenciacion text,
  pc_departamento text,
  pc_municipio text,
  pc_vereda text,
  inspeccion_ocular text,
  tipo_inspeccion_ocular text,
  fecha_inspeccion_ocular text,
  fecha_entidades text,
  anexo1_departamento text,
  anexo1_municipio text,
  anexo1_vereda text,
  autoridad_sanitaria text,
  fecha_reunion_entidades text,
  actividad_contaminante text,
  carac_fisica text,
  carac_quimica text,
  carac_microbiologica text,
  carac_especial text,
  cp_observaciones text,
  fuente_info text,
  nombre_documento text,
  tipo_documento text,
  autor text,
  fecha_publicacion text,
  entidad text,
  dependencia text,
  cargo text,
  anexo2_consecutivo text,
  anterior_mapa_riesgo text,
  bocatoma_fecha text,
  bocatoma_fisica text,
  bocatoma_quimica text,
  bocatoma_micro text,
  bocatoma_especiales text,
  bocatoma_descartadas text,
  red_fecha text,
  red_fisica text,
  red_quimica text,
  red_micro text,
  red_especiales text,
  red_descartadas text,
  medidas_sanitarias text,
  red_observaciones text,
  numero_resolucion text,
  fecha_expedicion text,
  archivo_resolucion text,
  seguimiento_consecutivo text,
  fecha_creacion text,
  fecha_actualizacion text,
  riesgo_actividad text,
  riesgo_entidad text,
  riesgo_evidencia text,
  riesgo_fecha text,
  riesgo_cumple text,
  seguridad_medida text,
  seguridad_fecha text,
  seguridad_observacion text,
  si_archivo text,
  si_acta text,
  si_fecha text,
  caracteristica_seguimiento text,
  frecuencia_pp text,
  minimo_muestras_pp text,
  frecuencia_as text,
  minimo_muestras_as text,
  processed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mapa_riesgo_staging_pkey PRIMARY KEY (id_staging)
);
CREATE TABLE public.muestra (
  id_muestra bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  muestra_no text NOT NULL,
  contramuestra_pp text,
  id_prestador bigint,
  id_laboratorio bigint,
  id_solicitante bigint,
  fecha_toma character varying,
  fecha_recepcion_lab character varying,
  fecha_analisis_lab character varying,
  desinfectante character varying,
  coagulante character varying,
  analisis_solicitados character varying,
  resultados_para character varying,
  observaciones character varying,
  nota character varying,
  irca_basico real,
  irca_especial real,
  irca real,
  nivel_riesgo character varying,
  id_muestreo bigint,
  codigo_laboratorio character varying,
  tipo_muestra character varying,
  CONSTRAINT muestra_pkey PRIMARY KEY (id_muestra),
  CONSTRAINT muestra_id_prestador_fkey FOREIGN KEY (id_prestador) REFERENCES public.prestador(id_prestador),
  CONSTRAINT muestra_id_laboratorio_fkey FOREIGN KEY (id_laboratorio) REFERENCES public.laboratorio(id_laboratorio),
  CONSTRAINT muestra_id_muestreo_fkey FOREIGN KEY (id_muestreo) REFERENCES public.punto_muestreo(id_muestreo)
);
CREATE TABLE public.muestra_staging (
  id_staging bigint NOT NULL DEFAULT nextval('muestra_staging_id_staging_seq'::regclass),
  nit text,
  muestra_no text,
  contramuestra_pp text,
  fecha_toma text,
  fecha_recepcion_lab text,
  fecha_analisis_lab text,
  desinfectante text,
  coagulante text,
  analisis_solicitados text,
  resultados_para text,
  observaciones text,
  nota text,
  irca_basico text,
  irca_especial text,
  irca text,
  nivel_riesgo text,
  id_muestreo text,
  codigo_laboratorio text,
  tipo_muestra text,
  codigo text,
  nombre text,
  descripcion text,
  departamento text,
  municipio text,
  vereda text,
  latitud text,
  longitud text,
  direccion text,
  tipo_analisis text,
  caracteristica text,
  metodo text,
  resultado text,
  unidades text,
  valores_aceptados text,
  diagnostico text,
  processed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT muestra_staging_pkey PRIMARY KEY (id_staging)
);
CREATE TABLE public.prestador (
  id_prestador bigint NOT NULL,
  nit text,
  id_autoridad_sanitaria text,
  nombre text,
  direccion text,
  telefono text,
  id_ubicacion bigint,
  codigo_sistema integer,
  codigo_anterior integer,
  nombre_sistema text,
  CONSTRAINT prestador_pkey PRIMARY KEY (id_prestador),
  CONSTRAINT prestador_id_ubicacion_fkey FOREIGN KEY (id_ubicacion) REFERENCES public.ubicacion(id_ubicacion)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  nombre text,
  email text,
  rol text DEFAULT 'usuario'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.punto_captacion (
  id_punto_captacion bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  tipo_captacion character varying NOT NULL,
  fuente_captacion character varying,
  georeferenciacion character varying,
  departamento character varying,
  municipio character varying,
  vereda character varying,
  latitud numeric,
  longitud numeric,
  CONSTRAINT punto_captacion_pkey PRIMARY KEY (id_punto_captacion)
);
CREATE TABLE public.punto_muestreo (
  id_muestreo bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  codigo character varying,
  nombre character varying,
  descripcion character varying,
  departamento character varying,
  municipio character varying,
  vereda character varying,
  latitud character varying,
  longitud character varying,
  direccion character varying,
  CONSTRAINT punto_muestreo_pkey PRIMARY KEY (id_muestreo)
);
CREATE TABLE public.red (
  id_red bigint NOT NULL DEFAULT nextval('red_id_red_seq'::regclass),
  fecha character varying,
  caract_fisicas character varying,
  caract_quimicas character varying,
  caract_microbiologicas character varying,
  caract_especiales character varying,
  descartadas character varying,
  medidas_sanitarias character varying,
  observaciones text,
  id_reporte2 bigint,
  CONSTRAINT red_pkey PRIMARY KEY (id_red),
  CONSTRAINT red_id_reporte2_fkey FOREIGN KEY (id_reporte2) REFERENCES public.anexo2(id_reporte2)
);
CREATE TABLE public.representante (
  id_representante bigint NOT NULL DEFAULT nextval('representante_id_representante_seq'::regclass),
  nombre text NOT NULL,
  cargo text,
  email text,
  id_prestador bigint,
  CONSTRAINT representante_pkey PRIMARY KEY (id_representante),
  CONSTRAINT representante_id_prestador_fkey FOREIGN KEY (id_prestador) REFERENCES public.prestador(id_prestador)
);
CREATE TABLE public.resolucion (
  id_resolucion bigint NOT NULL DEFAULT nextval('resolucion_id_resolucion_seq'::regclass),
  numero_resolucion character varying,
  fecha_expedicion character varying,
  archivo_resolucion character varying,
  id_reporte2 bigint,
  CONSTRAINT resolucion_pkey PRIMARY KEY (id_resolucion),
  CONSTRAINT resolucion_id_reporte2_fkey FOREIGN KEY (id_reporte2) REFERENCES public.anexo2(id_reporte2)
);
CREATE TABLE public.riesgo (
  id_riesgo bigint NOT NULL DEFAULT nextval('riesgo_id_riesgo_seq'::regclass),
  actividad character varying,
  entidad character varying,
  evidencia character varying,
  fecha character varying,
  cumple character varying,
  id_reporte3 bigint,
  CONSTRAINT riesgo_pkey PRIMARY KEY (id_riesgo),
  CONSTRAINT riesgo_id_reporte3_fkey FOREIGN KEY (id_reporte3) REFERENCES public.seguimiento(id_reporte3)
);
CREATE TABLE public.seguimiento (
  id_reporte3 bigint NOT NULL DEFAULT nextval('seguimiento_id_reporte3_seq'::regclass),
  consecutivo_mapa_riesgo character varying,
  fecha_creacion character varying,
  fecha_actualizacion character varying,
  id_mapa bigint,
  CONSTRAINT seguimiento_pkey PRIMARY KEY (id_reporte3),
  CONSTRAINT seguimiento_id_mapa_fkey FOREIGN KEY (id_mapa) REFERENCES public.mapa_riesgo(id_mapa)
);
CREATE TABLE public.seguimiento_caracteristica (
  id_caracteristica bigint NOT NULL DEFAULT nextval('caracteristica_id_caracteristica_seq'::regclass),
  caracteristica_seguimiento character varying,
  frecuencia_pp character varying,
  minimo_muestras_pp character varying,
  frecuencia_as character varying,
  minimo_muestras_as character varying,
  id_reporte3 bigint,
  CONSTRAINT seguimiento_caracteristica_pkey PRIMARY KEY (id_caracteristica),
  CONSTRAINT seguimiento_caracteristica_id_reporte3_fkey FOREIGN KEY (id_reporte3) REFERENCES public.seguimiento(id_reporte3)
);
CREATE TABLE public.seguimiento_inspeccion (
  id_inspeccion bigint NOT NULL DEFAULT nextval('seguimiento_inspeccion_id_inspeccion_seq'::regclass),
  nombre_archivo character varying,
  acta character varying,
  fecha_acta character varying,
  id_reporte3 bigint,
  CONSTRAINT seguimiento_inspeccion_pkey PRIMARY KEY (id_inspeccion),
  CONSTRAINT seguimiento_inspeccion_id_reporte3_fkey FOREIGN KEY (id_reporte3) REFERENCES public.seguimiento(id_reporte3)
);
CREATE TABLE public.seguridad (
  id_seguridad bigint NOT NULL DEFAULT nextval('seguridad_id_seguridad_seq'::regclass),
  medida character varying,
  fecha character varying,
  observacion character varying,
  id_reporte3 bigint,
  CONSTRAINT seguridad_pkey PRIMARY KEY (id_seguridad),
  CONSTRAINT seguridad_id_reporte3_fkey FOREIGN KEY (id_reporte3) REFERENCES public.seguimiento(id_reporte3)
);
CREATE TABLE public.solicitante (
  id_solicitante bigint NOT NULL DEFAULT nextval('solicitante_id_solicitante_seq'::regclass),
  nombre text NOT NULL,
  estado text DEFAULT 'activo'::text,
  id_ubicacion_sol bigint,
  CONSTRAINT solicitante_pkey PRIMARY KEY (id_solicitante),
  CONSTRAINT solicitante_id_ubicacion_sol_fkey FOREIGN KEY (id_ubicacion_sol) REFERENCES public.ubicacion_solicitante(id_ubicacion_sol)
);
CREATE TABLE public.tecnico (
  id_tecnico bigint NOT NULL DEFAULT nextval('tecnico_id_tecnico_seq'::regclass),
  identificacion bigint,
  nombre text NOT NULL,
  telefono text,
  profesion text,
  email text,
  id_ubicacion_tec bigint,
  id_laboratorio bigint,
  CONSTRAINT tecnico_pkey PRIMARY KEY (id_tecnico),
  CONSTRAINT tecnico_id_ubicacion_tec_fkey FOREIGN KEY (id_ubicacion_tec) REFERENCES public.ubicacion_tecnico(id_ubicacion_tec),
  CONSTRAINT tecnico_id_laboratorio_fkey FOREIGN KEY (id_laboratorio) REFERENCES public.laboratorio(id_laboratorio)
);
CREATE TABLE public.ubicacion (
  id_ubicacion bigint NOT NULL DEFAULT nextval('ubicacion_id_ubicacion_seq'::regclass),
  departamento text NOT NULL,
  municipio text NOT NULL,
  vereda text,
  CONSTRAINT ubicacion_pkey PRIMARY KEY (id_ubicacion)
);
CREATE TABLE public.ubicacion_laboratorio (
  id_ubicacion_lab bigint NOT NULL DEFAULT nextval('ubicacion_laboratorio_id_ubicacion_lab_seq'::regclass),
  departamento text NOT NULL,
  municipio text NOT NULL,
  direccion text,
  CONSTRAINT ubicacion_laboratorio_pkey PRIMARY KEY (id_ubicacion_lab)
);
CREATE TABLE public.ubicacion_solicitante (
  id_ubicacion_sol bigint NOT NULL DEFAULT nextval('ubicacion_solicitante_id_ubicacion_sol_seq'::regclass),
  departamento text NOT NULL,
  municipio text NOT NULL,
  CONSTRAINT ubicacion_solicitante_pkey PRIMARY KEY (id_ubicacion_sol)
);
CREATE TABLE public.ubicacion_tecnico (
  id_ubicacion_tec bigint NOT NULL DEFAULT nextval('ubicacion_tecnico_id_ubicacion_tec_seq'::regclass),
  departamento text NOT NULL,
  municipio text NOT NULL,
  direccion text,
  CONSTRAINT ubicacion_tecnico_pkey PRIMARY KEY (id_ubicacion_tec)
);