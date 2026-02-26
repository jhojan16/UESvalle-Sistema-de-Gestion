-- Admin-only deletion of user accounts
-- Deletes profile and auth user in a controlled way.

create or replace function public.admin_delete_user_account(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_exists boolean;
begin
  if p_user_id is null then
    raise exception 'El id de usuario es obligatorio';
  end if;

  if not public.current_user_is_admin() then
    raise exception 'No tienes permisos para eliminar cuentas';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'No puedes eliminar tu propia cuenta';
  end if;

  select exists(select 1 from auth.users u where u.id = p_user_id) into v_exists;
  if not v_exists then
    raise exception 'La cuenta no existe';
  end if;

  delete from public.profiles where id = p_user_id;
  delete from auth.users where id = p_user_id;

  return json_build_object('success', true, 'id', p_user_id);
end;
$$;

revoke all on function public.admin_delete_user_account(uuid) from public;
grant execute on function public.admin_delete_user_account(uuid) to authenticated;
