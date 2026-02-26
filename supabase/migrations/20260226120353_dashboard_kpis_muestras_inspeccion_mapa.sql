-- KPI layer for muestras, inspeccion and mapa_riesgo
-- Supports filters by anio and municipio for dashboard charts.

create or replace function public.parse_fecha_safe(p_fecha text)
returns date
language plpgsql
immutable
as $$
declare
  v_fecha text;
begin
  v_fecha := nullif(trim(p_fecha), '');

  if v_fecha is null then
    return null;
  end if;

  if v_fecha ~ '^\d{4}-\d{2}-\d{2}$' then
    return to_date(v_fecha, 'YYYY-MM-DD');
  elsif v_fecha ~ '^\d{4}/\d{2}/\d{2}$' then
    return to_date(v_fecha, 'YYYY/MM/DD');
  elsif v_fecha ~ '^\d{2}/\d{2}/\d{4}$' then
    return to_date(v_fecha, 'DD/MM/YYYY');
  elsif v_fecha ~ '^\d{2}-\d{2}-\d{4}$' then
    return to_date(v_fecha, 'DD-MM-YYYY');
  elsif v_fecha ~ '^\d{8}$' then
    return to_date(v_fecha, 'YYYYMMDD');
  elsif v_fecha ~ '^\d{2}/\d{2}/\d{2}$' then
    return to_date(v_fecha, 'DD/MM/YY');
  end if;

  return null;
exception
  when others then
    return null;
end;
$$;

create or replace view public.vw_kpi_muestras_base as
select
  m.id_muestra as id_registro,
  fx.fecha_evento,
  extract(year from fx.fecha_evento)::int as anio,
  coalesce(nullif(trim(pm.municipio), ''), nullif(trim(u.municipio), ''), 'SIN_MUNICIPIO') as municipio,
  m.irca,
  m.nivel_riesgo
from public.muestra m
left join lateral (
  select coalesce(
    public.parse_fecha_safe(m.fecha_toma),
    public.parse_fecha_safe(m.fecha_recepcion_lab),
    public.parse_fecha_safe(m.fecha_analisis_lab)
  ) as fecha_evento
) fx on true
left join public.punto_muestreo pm on pm.id_muestreo = m.id_muestreo
left join public.prestador p on p.id_prestador = m.id_prestador
left join public.ubicacion u on u.id_ubicacion = p.id_ubicacion;

create or replace view public.vw_kpi_inspeccion_base as
select
  i.id_inspeccion as id_registro,
  fx.fecha_evento,
  extract(year from fx.fecha_evento)::int as anio,
  coalesce(nullif(trim(u.municipio), ''), 'SIN_MUNICIPIO') as municipio,
  i.iraba_inspeccion,
  i.concepto,
  i.estado
from public.inspeccion i
left join lateral (
  select public.parse_fecha_safe(i.fecha_inspeccion) as fecha_evento
) fx on true
left join public.prestador p on p.id_prestador = i.id_prestador
left join public.ubicacion u on u.id_ubicacion = p.id_ubicacion;

create or replace view public.vw_kpi_mapa_riesgo_base as
select
  mr.id_mapa as id_registro,
  coalesce(sx.fecha_evento, ax.fecha_evento) as fecha_evento,
  extract(year from coalesce(sx.fecha_evento, ax.fecha_evento))::int as anio,
  coalesce(
    nullif(trim(pc.municipio), ''),
    nullif(trim(ax.municipio), ''),
    nullif(trim(u.municipio), ''),
    'SIN_MUNICIPIO'
  ) as municipio,
  (sx.id_reporte3 is not null) as tiene_seguimiento
from public.mapa_riesgo mr
left join public.punto_captacion pc on pc.id_punto_captacion = mr.id_punto_captacion
left join public.prestador p on p.id_prestador = mr.id_prestador
left join public.ubicacion u on u.id_ubicacion = p.id_ubicacion
left join lateral (
  select
    a1.id_reporte1,
    a1.municipio,
    coalesce(
      public.parse_fecha_safe(a1.fecha_entidades),
      public.parse_fecha_safe(a1.fecha_inspeccion_ocular),
      public.parse_fecha_safe(a1.fecha_reunion_entidades)
    ) as fecha_evento
  from public.anexo a1
  where a1.id_mapa = mr.id_mapa
  order by coalesce(
    public.parse_fecha_safe(a1.fecha_entidades),
    public.parse_fecha_safe(a1.fecha_inspeccion_ocular),
    public.parse_fecha_safe(a1.fecha_reunion_entidades)
  ) desc nulls last, a1.id_reporte1 desc
  limit 1
) ax on true
left join lateral (
  select
    s1.id_reporte3,
    coalesce(
      public.parse_fecha_safe(s1.fecha_actualizacion),
      public.parse_fecha_safe(s1.fecha_creacion)
    ) as fecha_evento
  from public.seguimiento s1
  where s1.id_mapa = mr.id_mapa
  order by coalesce(
    public.parse_fecha_safe(s1.fecha_actualizacion),
    public.parse_fecha_safe(s1.fecha_creacion)
  ) desc nulls last, s1.id_reporte3 desc
  limit 1
) sx on true;

create or replace function public.dashboard_kpis_resumen(
  p_anio integer default null,
  p_municipio text default null
)
returns table (
  scope text,
  muestras_total bigint,
  inspecciones_total bigint,
  mapas_total bigint,
  irca_promedio numeric(10,2),
  iraba_promedio numeric(10,2)
)
language sql
stable
security definer
set search_path = public
as $$
with parametros as (
  select
    p_anio as anio,
    nullif(upper(trim(coalesce(p_municipio, ''))), '') as municipio
),
m as (
  select vm.*
  from public.vw_kpi_muestras_base vm
  cross join parametros p
  where (p.anio is null or vm.anio = p.anio)
    and (p.municipio is null or upper(vm.municipio) = p.municipio)
),
i as (
  select vi.*
  from public.vw_kpi_inspeccion_base vi
  cross join parametros p
  where (p.anio is null or vi.anio = p.anio)
    and (p.municipio is null or upper(vi.municipio) = p.municipio)
),
r as (
  select vr.*
  from public.vw_kpi_mapa_riesgo_base vr
  cross join parametros p
  where (p.anio is null or vr.anio = p.anio)
    and (p.municipio is null or upper(vr.municipio) = p.municipio)
)
select
  'RESUMEN'::text as scope,
  (select count(*)::bigint from m) as muestras_total,
  (select count(*)::bigint from i) as inspecciones_total,
  (select count(*)::bigint from r) as mapas_total,
  coalesce((select round(avg(m.irca)::numeric, 2) from m where m.irca is not null), 0)::numeric(10,2) as irca_promedio,
  coalesce((select round(avg(i.iraba_inspeccion)::numeric, 2) from i where i.iraba_inspeccion is not null), 0)::numeric(10,2) as iraba_promedio;
$$;

create or replace function public.dashboard_kpis_por_municipio(
  p_anio integer default null
)
returns table (
  municipio text,
  muestras_total bigint,
  inspecciones_total bigint,
  mapas_total bigint,
  irca_promedio numeric(10,2),
  iraba_promedio numeric(10,2)
)
language sql
stable
security definer
set search_path = public
as $$
with m as (
  select
    vm.municipio,
    count(*)::bigint as muestras_total,
    coalesce(round(avg(vm.irca)::numeric, 2), 0)::numeric(10,2) as irca_promedio
  from public.vw_kpi_muestras_base vm
  where p_anio is null or vm.anio = p_anio
  group by vm.municipio
),
i as (
  select
    vi.municipio,
    count(*)::bigint as inspecciones_total,
    coalesce(round(avg(vi.iraba_inspeccion)::numeric, 2), 0)::numeric(10,2) as iraba_promedio
  from public.vw_kpi_inspeccion_base vi
  where p_anio is null or vi.anio = p_anio
  group by vi.municipio
),
r as (
  select
    vr.municipio,
    count(*)::bigint as mapas_total
  from public.vw_kpi_mapa_riesgo_base vr
  where p_anio is null or vr.anio = p_anio
  group by vr.municipio
),
keys as (
  select municipio from m
  union
  select municipio from i
  union
  select municipio from r
)
select
  k.municipio,
  coalesce(m.muestras_total, 0)::bigint as muestras_total,
  coalesce(i.inspecciones_total, 0)::bigint as inspecciones_total,
  coalesce(r.mapas_total, 0)::bigint as mapas_total,
  coalesce(m.irca_promedio, 0)::numeric(10,2) as irca_promedio,
  coalesce(i.iraba_promedio, 0)::numeric(10,2) as iraba_promedio
from keys k
left join m on m.municipio = k.municipio
left join i on i.municipio = k.municipio
left join r on r.municipio = k.municipio
order by muestras_total desc, inspecciones_total desc, mapas_total desc, k.municipio;
$$;

create or replace function public.dashboard_kpis_tendencia_mensual(
  p_anio integer default null,
  p_municipio text default null
)
returns table (
  mes integer,
  muestras_total bigint,
  inspecciones_total bigint,
  mapas_total bigint
)
language sql
stable
security definer
set search_path = public
as $$
with parametros as (
  select
    coalesce(p_anio, extract(year from current_date)::int) as anio,
    nullif(upper(trim(coalesce(p_municipio, ''))), '') as municipio
),
meses as (
  select generate_series(1, 12)::int as mes
),
m as (
  select
    extract(month from vm.fecha_evento)::int as mes,
    count(*)::bigint as total
  from public.vw_kpi_muestras_base vm
  cross join parametros p
  where vm.anio = p.anio
    and (p.municipio is null or upper(vm.municipio) = p.municipio)
  group by extract(month from vm.fecha_evento)::int
),
i as (
  select
    extract(month from vi.fecha_evento)::int as mes,
    count(*)::bigint as total
  from public.vw_kpi_inspeccion_base vi
  cross join parametros p
  where vi.anio = p.anio
    and (p.municipio is null or upper(vi.municipio) = p.municipio)
  group by extract(month from vi.fecha_evento)::int
),
r as (
  select
    extract(month from vr.fecha_evento)::int as mes,
    count(*)::bigint as total
  from public.vw_kpi_mapa_riesgo_base vr
  cross join parametros p
  where vr.anio = p.anio
    and (p.municipio is null or upper(vr.municipio) = p.municipio)
  group by extract(month from vr.fecha_evento)::int
)
select
  meses.mes,
  coalesce(m.total, 0)::bigint as muestras_total,
  coalesce(i.total, 0)::bigint as inspecciones_total,
  coalesce(r.total, 0)::bigint as mapas_total
from meses
left join m on m.mes = meses.mes
left join i on i.mes = meses.mes
left join r on r.mes = meses.mes
order by meses.mes;
$$;

revoke all on function public.dashboard_kpis_resumen(integer, text) from public;
revoke all on function public.dashboard_kpis_por_municipio(integer) from public;
revoke all on function public.dashboard_kpis_tendencia_mensual(integer, text) from public;

grant execute on function public.dashboard_kpis_resumen(integer, text) to authenticated;
grant execute on function public.dashboard_kpis_por_municipio(integer) to authenticated;
grant execute on function public.dashboard_kpis_tendencia_mensual(integer, text) to authenticated;
