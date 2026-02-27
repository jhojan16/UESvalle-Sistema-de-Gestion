create or replace function public.admin_update_user_role(
  p_user_id uuid,
  p_role text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  if p_user_id is null then
    raise exception 'El id de usuario es obligatorio';
  end if;

  v_role := lower(trim(coalesce(p_role, '')));

  if v_role = '' then
    raise exception 'El rol es obligatorio';
  end if;

  if v_role not in ('usuario', 'administrador', 'admin') then
    raise exception 'Rol no permitido';
  end if;

  if not public.current_user_is_admin() then
    raise exception 'No tienes permisos para cambiar roles';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = p_user_id
  ) then
    raise exception 'El perfil no existe';
  end if;

  update public.profiles
  set
    rol = case when v_role = 'admin' then 'administrador' else v_role end,
    updated_at = now()
  where id = p_user_id;

  return json_build_object(
    'success', true,
    'id', p_user_id,
    'rol', case when v_role = 'admin' then 'administrador' else v_role end
  );
end;
$$;

revoke all on function public.admin_update_user_role(uuid, text) from public;
grant execute on function public.admin_update_user_role(uuid, text) to authenticated;
