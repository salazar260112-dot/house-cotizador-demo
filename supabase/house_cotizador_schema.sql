create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null unique,
  password_demo text,
  rol text not null check (rol in ('asesor', 'supervisor')),
  sucursal text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  modelo text not null,
  marca text not null,
  descripcion text not null,
  color text,
  imagen_url text,
  precio_usd numeric(12,2) default 0,
  precio_mxn numeric(12,2) default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.cotizaciones (
  id uuid primary key default gen_random_uuid(),
  folio text unique,
  fecha_cotizacion date not null,
  cliente_nombre text not null,
  cliente_telefono text not null,
  cliente_correo text not null,
  cliente_ciudad text,
  origen text not null,
  sucursal text not null,
  asesor_id uuid,
  asesor_nombre text not null,
  fuente_lead text,
  observaciones text,
  subtotal numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  moneda_principal text not null default 'MXN' check (moneda_principal in ('USD', 'MXN')),
  estatus text not null default 'Pendiente',
  pdf_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.cotizacion_detalle (
  id uuid primary key default gen_random_uuid(),
  cotizacion_id uuid not null references public.cotizaciones(id) on delete cascade,
  producto_id uuid references public.productos(id),
  sku text not null,
  modelo text,
  descripcion text not null,
  cantidad integer not null check (cantidad > 0),
  moneda text not null check (moneda in ('USD', 'MXN')),
  precio_unitario numeric(12,2) not null default 0,
  subtotal numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_productos_search on public.productos using gin (
  to_tsvector('simple', coalesce(sku,'') || ' ' || coalesce(modelo,'') || ' ' || coalesce(marca,'') || ' ' || coalesce(descripcion,''))
);
create index if not exists idx_cotizaciones_fecha on public.cotizaciones(fecha_cotizacion);
create index if not exists idx_cotizaciones_asesor on public.cotizaciones(asesor_id);
create index if not exists idx_cotizaciones_origen on public.cotizaciones(origen);

create or replace function public.set_cotizacion_folio()
returns trigger
language plpgsql
as $$
begin
  if new.folio is null or new.folio = '' then
    new.folio := 'COT-' || to_char(new.fecha_cotizacion, 'YYYY') || '-' || lpad(nextval('public.cotizaciones_folio_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

do $$
begin
  create sequence public.cotizaciones_folio_seq;
exception
  when duplicate_table then null;
end $$;

drop trigger if exists trg_set_cotizacion_folio on public.cotizaciones;
create trigger trg_set_cotizacion_folio
before insert on public.cotizaciones
for each row execute function public.set_cotizacion_folio();

alter table public.users enable row level security;
alter table public.productos enable row level security;
alter table public.cotizaciones enable row level security;
alter table public.cotizacion_detalle enable row level security;

drop policy if exists "demo users read" on public.users;
drop policy if exists "demo products read" on public.productos;
drop policy if exists "demo quotes read write" on public.cotizaciones;
drop policy if exists "demo quote detail read write" on public.cotizacion_detalle;

create policy "demo users read" on public.users for select using (true);
create policy "demo products read" on public.productos for select using (true);
create policy "demo quotes read write" on public.cotizaciones for all using (true) with check (true);
create policy "demo quote detail read write" on public.cotizacion_detalle for all using (true) with check (true);

insert into public.users (nombre, email, password_demo, rol, sucursal, activo)
values
  ('Enrique Salazar', 'house@gmail.com', '12345', 'supervisor', 'Corporativo', true),
  ('Carlos Mendoza', 'carlos.mendoza@cotizacioneshouse.com', 'house2026', 'asesor', 'Culiacan', true),
  ('Maria Fernanda Lopez', 'maria.lopez@cotizacioneshouse.com', 'house2026', 'asesor', 'Hermosillo', true),
  ('Roberto Gutierrez', 'roberto.gutierrez@cotizacioneshouse.com', 'house2026', 'asesor', 'Los Cabos', true),
  ('Ana Patricia Silva', 'ana.silva@cotizacioneshouse.com', 'house2026', 'asesor', 'Culiacan', true),
  ('Jorge Eduardo Nunez', 'jorge.nunez@cotizacioneshouse.com', 'house2026', 'asesor', 'Hermosillo', true)
on conflict (email) do update set
  nombre = excluded.nombre,
  password_demo = excluded.password_demo,
  rol = excluded.rol,
  sucursal = excluded.sucursal,
  activo = excluded.activo;

insert into public.productos (sku, modelo, marca, descripcion, color, precio_usd, precio_mxn, imagen_url, activo)
values
  ('CAF-CTS90DP4NW2', 'CTS90DP4NW2', 'Cafe', 'Horno electrico de pared 30 pulgadas, conveccion europea, acabado blanco mate, controles tactiles y conectividad.', 'Blanco mate', 0, 0, 'https://placehold.co/600x600?text=Cafe+Horno', true),
  ('CAF-CHS90XP2MS1', 'CHS90XP2MS1', 'Cafe', 'Estufa slide-in de induccion 30 pulgadas con horno de conveccion, acero inoxidable y controles frontales.', 'Acero inoxidable', 0, 0, 'https://placehold.co/600x600?text=Cafe+Estufa', true),
  ('MON-ZET1FHSS', 'ZET1FHSS', 'Monogram', 'Horno de pared profesional 30 pulgadas, conveccion, sonda de temperatura y acabado en acero inoxidable.', 'Acero inoxidable', 0, 0, 'https://placehold.co/600x600?text=Monogram+Horno', true),
  ('MON-ZGU36RSLSS', 'ZGU36RSLSS', 'Monogram', 'Parrilla de gas profesional 36 pulgadas con quemadores de alto desempeno y parrillas robustas.', 'Acero inoxidable', 0, 0, 'https://placehold.co/600x600?text=Monogram+Parrilla', true),
  ('MAB-IO6060HEWI0', 'IO6060HEWI0', 'IO Mabe', 'Horno empotrable electrico 60 cm con acabado espejo, funciones programables y diseno moderno.', 'Espejo negro', 0, 0, 'https://placehold.co/600x600?text=IO+Mabe+Horno', true),
  ('MAB-EM7646BSIS0', 'EM7646BSIS0', 'Mabe', 'Estufa de piso 30 pulgadas, horno amplio, parrillas de fundicion y cubierta sellada.', 'Acero inoxidable', 0, 0, 'https://placehold.co/600x600?text=Mabe+Estufa', true)
on conflict (sku) do update set
  modelo = excluded.modelo,
  marca = excluded.marca,
  descripcion = excluded.descripcion,
  color = excluded.color,
  precio_usd = excluded.precio_usd,
  precio_mxn = excluded.precio_mxn,
  imagen_url = excluded.imagen_url,
  activo = excluded.activo;

