-- 2025_0001_init.sql - Tellerplan full schema for Supabase
-- If supabase/migrations is read-only here, copy this file into supabase/migrations before running `supabase db push`.

BEGIN;

create extension if not exists "pgcrypto";

create type cooking_style as enum ('daily_chef','clever_cook','weekend_pro');
create type difficulty_level as enum ('easy','medium','hard');
create type meal_type as enum ('breakfast','lunch','dinner','snack');
create type aisle_category as enum (
  'produce','bakery','meat','seafood','dairy','frozen','pantry','beverages','household','personal_care','other'
);

create table if not exists cuisines (
  id bigserial primary key,
  name text unique not null
);

create table if not exists dietary_preferences (
  id bigserial primary key,
  name text unique not null
);

create table if not exists health_goals (
  id bigserial primary key,
  name text unique not null
);

create table if not exists recipe_tags (
  id bigserial primary key,
  name text unique not null
);

create table if not exists ingredients (
  id bigserial primary key,
  name text unique not null,
  aisle aisle_category not null default 'other',
  default_unit text
);

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  household_size int not null default 1 check (household_size >= 1),
  cooking_style cooking_style not null default 'daily_chef',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profile_dietary_preferences (
  user_id uuid references profiles(user_id) on delete cascade,
  preference_id bigint references dietary_preferences(id) on delete cascade,
  primary key (user_id, preference_id)
);

create table if not exists profile_health_goals (
  user_id uuid references profiles(user_id) on delete cascade,
  goal_id bigint references health_goals(id) on delete cascade,
  primary key (user_id, goal_id)
);

create table if not exists profile_cuisine_interests (
  user_id uuid references profiles(user_id) on delete cascade,
  cuisine_id bigint references cuisines(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  primary key (user_id, cuisine_id)
);

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cuisine_id bigint references cuisines(id),
  description text,
  instructions text,
  prep_time_minutes int check (prep_time_minutes >= 0),
  cook_time_minutes int check (cook_time_minutes >= 0),
  difficulty difficulty_level,
  servings int check (servings > 0),
  is_batch_cook boolean not null default false,
  image_url text,
  public boolean not null default true,
  created_by uuid references profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists recipes_cuisine_idx on recipes (cuisine_id);

create table if not exists recipe_to_tags (
  recipe_id uuid references recipes(id) on delete cascade,
  tag_id bigint references recipe_tags(id) on delete cascade,
  primary key (recipe_id, tag_id)
);

create table if not exists recipe_ingredients (
  id bigserial primary key,
  recipe_id uuid not null references recipes(id) on delete cascade,
  ingredient_id bigint not null references ingredients(id),
  quantity numeric(10,3) not null default 0,
  unit text,
  preparation text
);
create index if not exists recipe_ingredients_recipe_idx on recipe_ingredients (recipe_id);
create index if not exists recipe_ingredients_ingredient_idx on recipe_ingredients (ingredient_id);

create table if not exists meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(user_id) on delete cascade,
  title text,
  start_date date not null,
  days int not null check (days >= 1 and days <= 31),
  model cooking_style not null default 'daily_chef',
  created_at timestamptz not null default now()
);
create index if not exists meal_plans_user_start_idx on meal_plans (user_id, start_date);

create table if not exists meal_plan_meals (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references meal_plans(id) on delete cascade,
  day_index int not null check (day_index >= 0 and day_index <= 30),
  meal meal_type not null default 'dinner',
  recipe_id uuid not null references recipes(id),
  servings_override int check (servings_override > 0),
  notes text
);
create index if not exists meal_plan_meals_plan_day_meal_idx on meal_plan_meals (meal_plan_id, day_index, meal);

create table if not exists meal_swaps (
  id uuid primary key default gen_random_uuid(),
  meal_plan_meal_id uuid not null references meal_plan_meals(id) on delete cascade,
  from_recipe_id uuid references recipes(id),
  to_recipe_id uuid references recipes(id),
  swapped_at timestamptz not null default now()
);

create table if not exists shopping_lists (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references meal_plans(id) on delete cascade,
  user_id uuid not null references profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (meal_plan_id)
);
create index if not exists shopping_lists_user_idx on shopping_lists (user_id);

create table if not exists shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null references shopping_lists(id) on delete cascade,
  ingredient_id bigint not null references ingredients(id),
  total_quantity numeric(12,3),
  unit text,
  aisle aisle_category,
  checked boolean not null default false
);
create index if not exists shopping_list_items_list_idx on shopping_list_items (shopping_list_id);
create index if not exists shopping_list_items_ingredient_idx on shopping_list_items (ingredient_id);

create table if not exists vendors (
  id bigserial primary key,
  name text not null unique,
  country text,
  website text
);

create table if not exists stores (
  id bigserial primary key,
  vendor_id bigint not null references vendors(id) on delete cascade,
  name text,
  city text,
  postcode text,
  latitude double precision,
  longitude double precision
);
create index if not exists stores_vendor_city_idx on stores (vendor_id, city);

create table if not exists products (
  id bigserial primary key,
  vendor_id bigint not null references vendors(id) on delete cascade,
  name text not null,
  brand text,
  size_text text,
  ingredient_id bigint references ingredients(id),
  aisle aisle_category
);
create index if not exists products_vendor_ingredient_idx on products (vendor_id, ingredient_id);

create table if not exists product_aliases (
  id bigserial primary key,
  ingredient_id bigint not null references ingredients(id) on delete cascade,
  alias text not null,
  unique (ingredient_id, alias)
);

create table if not exists product_prices (
  id bigserial primary key,
  product_id bigint not null references products(id) on delete cascade,
  store_id bigint references stores(id) on delete set null,
  price_cents integer not null check (price_cents >= 0),
  currency char(3) not null default 'EUR',
  valid_from timestamptz not null default now(),
  valid_to timestamptz
);
create index if not exists product_prices_product_valid_idx on product_prices (product_id, valid_from desc);

create or replace view v_aggregated_shopping_list as
select
  mpl.id as meal_plan_id,
  ri.ingredient_id,
  i.name as ingredient_name,
  i.aisle,
  coalesce(sum(ri.quantity), 0) as total_quantity,
  coalesce(ri.unit, i.default_unit) as unit
from meal_plans mpl
join meal_plan_meals mpm on mpm.meal_plan_id = mpl.id
join recipes r on r.id = mpm.recipe_id
join recipe_ingredients ri on ri.recipe_id = r.id
join ingredients i on i.id = ri.ingredient_id
group by mpl.id, ri.ingredient_id, i.name, i.aisle, unit;

alter table profiles enable row level security;
alter table profile_dietary_preferences enable row level security;
alter table profile_health_goals enable row level security;
alter table profile_cuisine_interests enable row level security;
alter table recipes enable row level security;
alter table recipe_to_tags enable row level security;
alter table recipe_ingredients enable row level security;
alter table meal_plans enable row level security;
alter table meal_plan_meals enable row level security;
alter table meal_swaps enable row level security;
alter table shopping_lists enable row level security;
alter table shopping_list_items enable row level security;
alter table ingredients enable row level security;
alter table cuisines enable row level security;
alter table dietary_preferences enable row level security;
alter table health_goals enable row level security;
alter table recipe_tags enable row level security;
alter table vendors enable row level security;
alter table stores enable row level security;
alter table products enable row level security;
alter table product_aliases enable row level security;
alter table product_prices enable row level security;
alter view v_aggregated_shopping_list set (security_invoker = on);

create policy if not exists "Public read - cuisines" on cuisines for select using (true);
create policy if not exists "Public read - dietary_preferences" on dietary_preferences for select using (true);
create policy if not exists "Public read - health_goals" on health_goals for select using (true);
create policy if not exists "Public read - ingredients" on ingredients for select using (true);
create policy if not exists "Public read - recipe_tags" on recipe_tags for select using (true);
create policy if not exists "Public read - recipes" on recipes for select using (true);
create policy if not exists "Public read - recipe_ingredients" on recipe_ingredients for select using (true);
create policy if not exists "Public read - recipe_to_tags" on recipe_to_tags for select using (true);
create policy if not exists "Public read - v_aggregated_shopping_list" on v_aggregated_shopping_list for select using (true);
create policy if not exists "Public read - vendors" on vendors for select using (true);
create policy if not exists "Public read - stores" on stores for select using (true);
create policy if not exists "Public read - products" on products for select using (true);
create policy if not exists "Public read - product_prices" on product_prices for select using (true);
create policy if not exists "Public read - product_aliases" on product_aliases for select using (true);

create policy if not exists "Users can view own profile" on profiles for select using (auth.uid() = user_id);
create policy if not exists "Users can manage own profile" on profiles for insert with check (auth.uid() = user_id);
create policy if not exists "Users can update own profile" on profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "Users can delete own profile" on profiles for delete using (auth.uid() = user_id);

create policy if not exists "Users manage own dietary prefs" on profile_dietary_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "Users manage own health goals" on profile_health_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "Users manage own cuisine interests" on profile_cuisine_interests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "Users manage own meal plans" on meal_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "Users manage own meals" on meal_plan_meals
  for all using (
    exists (select 1 from meal_plans mp where mp.id = meal_plan_id and mp.user_id = auth.uid())
  ) with check (
    exists (select 1 from meal_plans mp where mp.id = meal_plan_id and mp.user_id = auth.uid())
  );

create policy if not exists "Users manage own meal swaps" on meal_swaps
  for all using (
    exists (
      select 1 from meal_plan_meals m where m.id = meal_plan_meal_id
      and exists (select 1 from meal_plans mp where mp.id = m.meal_plan_id and mp.user_id = auth.uid())
    )
  ) with check (
    exists (
      select 1 from meal_plan_meals m where m.id = meal_plan_meal_id
      and exists (select 1 from meal_plans mp where mp.id = m.meal_plan_id and mp.user_id = auth.uid())
    )
  );

create policy if not exists "Users manage own shopping lists" on shopping_lists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "Users manage own shopping items" on shopping_list_items
  for all using (
    exists (select 1 from shopping_lists sl where sl.id = shopping_list_id and sl.user_id = auth.uid())
  ) with check (
    exists (select 1 from shopping_lists sl where sl.id = shopping_list_id and sl.user_id = auth.uid())
  );

create policy if not exists "Authenticated can insert own recipes" on recipes
  for insert with check (created_by = auth.uid());

create policy if not exists "Authors can update own recipes" on recipes
  for update using (created_by = auth.uid()) with check (created_by = auth.uid());

COMMIT;
