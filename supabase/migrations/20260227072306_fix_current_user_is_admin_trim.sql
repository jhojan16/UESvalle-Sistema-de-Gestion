-- Fix admin role detection for RLS checks (normalize whitespace and case)

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
      and lower(trim(coalesce(p.rol, ''))) in ('administrador', 'admin')
  );
$$;

-- Keep insert policy aligned with normalized role values

drop policy if exists profiles_insert_self_or_admin on public.profiles;

create policy profiles_insert_self_or_admin
on public.profiles
for insert
to authenticated
with check (
  public.current_user_is_admin()
  or (
    id = auth.uid()
    and lower(trim(coalesce(rol, 'usuario'))) = 'usuario'
  )
);
