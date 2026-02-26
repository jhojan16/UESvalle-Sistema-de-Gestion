-- Fix date parsing for KPI layer and expose available years.

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

  -- Keep only date part when datetime arrives (e.g. 2025-01-31 10:20:30 or 2025-01-31T10:20:30)
  if strpos(v_fecha, 'T') > 0 then
    v_fecha := split_part(v_fecha, 'T', 1);
  elsif strpos(v_fecha, ' ') > 0 then
    v_fecha := split_part(v_fecha, ' ', 1);
  end if;

  if v_fecha ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    return to_date(v_fecha, 'YYYY-MM-DD');
  elsif v_fecha ~ '^[0-9]{4}/[0-9]{2}/[0-9]{2}$' then
    return to_date(v_fecha, 'YYYY/MM/DD');
  elsif v_fecha ~ '^[0-9]{2}/[0-9]{2}/[0-9]{4}$' then
    return to_date(v_fecha, 'DD/MM/YYYY');
  elsif v_fecha ~ '^[0-9]{2}-[0-9]{2}-[0-9]{4}$' then
    return to_date(v_fecha, 'DD-MM-YYYY');
  elsif v_fecha ~ '^[0-9]{8}$' then
    return to_date(v_fecha, 'YYYYMMDD');
  elsif v_fecha ~ '^[0-9]{2}/[0-9]{2}/[0-9]{2}$' then
    return to_date(v_fecha, 'DD/MM/YY');
  end if;

  return null;
exception
  when others then
    return null;
end;
$$;

create or replace function public.dashboard_kpis_anios_disponibles()
returns table (
  anio integer
)
language sql
stable
security definer
set search_path = public
as $$
  with years as (
    select anio from public.vw_kpi_muestras_base where anio is not null
    union
    select anio from public.vw_kpi_inspeccion_base where anio is not null
    union
    select anio from public.vw_kpi_mapa_riesgo_base where anio is not null
  )
  select y.anio
  from years y
  order by y.anio desc;
$$;

revoke all on function public.dashboard_kpis_anios_disponibles() from public;
grant execute on function public.dashboard_kpis_anios_disponibles() to authenticated;
