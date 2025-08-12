# Supabase Migrations for Tellerplan

This folder contains SQL migrations to bootstrap the full Tellerplan schema (profiles, personalization, recipes, meal plans, shopping, and vendor pricing).

## Prerequisites
- Supabase account and project (can be added later)
- Supabase CLI installed: https://supabase.com/docs/guides/cli

## Apply to a Supabase project (later)
1. Link your project:
   supabase link --project-ref your-project-ref
2. Push migrations:
   supabase db push

## Run locally (optional)
- Start local stack:
  supabase start
- Reset and apply migrations:
  supabase db reset

## Notes
- RLS is enabled with sensible defaults:
  - User-owned data locked to auth.uid()
  - Public read for reference data (recipes, ingredients, vendors, etc.)
- View `v_aggregated_shopping_list` helps combine ingredients per meal plan.
- Extend as needed (e.g., additional units, aisles, or price sources).
