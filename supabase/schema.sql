-- ============================================================
-- NutriTrack — Supabase Schema
-- Run this in the Supabase SQL Editor (in order, once)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── FOOD ITEMS ──────────────────────────────────────────────
create table food_items (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  brand        text,
  kcal         numeric not null,       -- per 100 g/ml
  protein      numeric not null default 0,
  carbs        numeric not null default 0,
  fats         numeric not null default 0,
  fiber        numeric not null default 0,
  unit         text not null default 'g' check (unit in ('g','ml','unidad')),
  created_at   timestamptz default now()
);

-- ── RECIPES ─────────────────────────────────────────────────
create table recipes (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  final_weight  numeric not null default 100,
  notes         text not null default '',
  created_at    timestamptz default now()
);

create table recipe_ingredients (
  id            uuid primary key default uuid_generate_v4(),
  recipe_id     uuid not null references recipes(id) on delete cascade,
  food_item_id  uuid not null references food_items(id) on delete restrict,
  grams         numeric not null
);

-- ── DAILY LOGS ──────────────────────────────────────────────
create table daily_logs (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  date          date not null,
  day_kind      text not null default 'deficit'
                  check (day_kind in ('deficit','mantenimiento','entreno','partido')),
  water_ml      numeric not null default 0,
  hunger        int check (hunger between 1 and 5),
  energy        int check (energy between 1 and 5),
  digestion     text not null default '',
  unique (user_id, date)
);

create table meal_logs (
  id            uuid primary key default uuid_generate_v4(),
  daily_log_id  uuid not null references daily_logs(id) on delete cascade,
  meal_type     text not null
                  check (meal_type in ('desayuno','almuerzo','merienda','cena','snack')),
  food_item_id  uuid references food_items(id) on delete restrict,
  recipe_id     uuid references recipes(id) on delete restrict,
  grams         numeric not null,
  logged_at     timestamptz default now(),
  -- denormalised macros so we don't re-derive on every read
  kcal          numeric not null,
  protein       numeric not null,
  carbs         numeric not null,
  fats          numeric not null,
  fiber         numeric not null,
  constraint chk_food_or_recipe check (
    (food_item_id is not null and recipe_id is null) or
    (food_item_id is null     and recipe_id is not null)
  )
);

-- ── MEASUREMENTS ────────────────────────────────────────────
create table measurements (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  date          date not null,
  weight        numeric,
  waist         numeric,
  hips          numeric,
  thigh         numeric,
  arm           numeric,
  underbust     numeric,
  created_at    timestamptz default now(),
  unique (user_id, date)
);

-- ── USER GOALS ───────────────────────────────────────────────
create table user_goals (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade unique,
  kcal            numeric not null default 2400,
  protein         numeric not null default 180,
  carbs           numeric not null default 260,
  fats            numeric not null default 75,
  water           numeric not null default 3000,
  fiber           numeric not null default 30,
  updated_at      timestamptz default now()
);

-- ── USER PROFILES (display name) ────────────────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  updated_at  timestamptz default now()
);

-- auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  insert into user_goals (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
alter table food_items        enable row level security;
alter table recipes           enable row level security;
alter table recipe_ingredients enable row level security;
alter table daily_logs        enable row level security;
alter table meal_logs         enable row level security;
alter table measurements      enable row level security;
alter table user_goals        enable row level security;
alter table profiles          enable row level security;

-- food_items
create policy "own food_items" on food_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- recipes
create policy "own recipes" on recipes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- recipe_ingredients (access via parent recipe)
create policy "own recipe_ingredients" on recipe_ingredients for all
  using (recipe_id in (select id from recipes where user_id = auth.uid()))
  with check (recipe_id in (select id from recipes where user_id = auth.uid()));

-- daily_logs
create policy "own daily_logs" on daily_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- meal_logs (access via parent daily_log)
create policy "own meal_logs" on meal_logs for all
  using (daily_log_id in (select id from daily_logs where user_id = auth.uid()))
  with check (daily_log_id in (select id from daily_logs where user_id = auth.uid()));

-- measurements
create policy "own measurements" on measurements for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user_goals
create policy "own user_goals" on user_goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- profiles
create policy "own profile" on profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);
