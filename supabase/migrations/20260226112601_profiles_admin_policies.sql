-- Profiles RLS for admin/user management
-- - Usuarios: solo pueden ver/editar su propio perfil
-- - Administradores: pueden ver/editar todos los perfiles
-- - Usuarios no pueden escalar su rol a administrador

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.rol, '')) in ('administrador', 'admin')
  );
$$;

revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_admin() to authenticated;

alter table public.profiles enable row level security;

drop policy if exists profiles_select_self_or_admin on public.profiles;
drop policy if exists profiles_insert_self_or_admin on public.profiles;
drop policy if exists profiles_update_self_or_admin on public.profiles;
drop policy if exists profiles_update_self_no_role_escalation_or_admin on public.profiles;

create policy profiles_select_self_or_admin
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.current_user_is_admin()
);

create policy profiles_insert_self_or_admin
on public.profiles
for insert
to authenticated
with check (
  public.current_user_is_admin()
  or (
    id = auth.uid()
    and lower(coalesce(rol, 'usuario')) = 'usuario'
  )
);

create policy profiles_update_self_no_role_escalation_or_admin
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
  or public.current_user_is_admin()
)
with check (
  public.current_user_is_admin()
  or (
    id = auth.uid()
    and rol = (
      select p.rol
      from public.profiles p
      where p.id = auth.uid()
      limit 1
    )
  )
);
