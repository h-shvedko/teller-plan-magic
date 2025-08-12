# Database migrations (fallback location)

We could not write to `supabase/migrations` in this environment, so the SQL lives here.

How to apply when you connect Supabase later:

Option A — Copy files into Supabase migrations and push
1) Create the folder in your repo: `supabase/migrations/`
2) Move files from `db/migrations/*.sql` into `supabase/migrations/`
3) Install Supabase CLI and link: `supabase link --project-ref <project-ref>`
4) Push: `supabase db push`

Option B — Run directly in SQL editor
1) Open Supabase project → SQL Editor
2) Paste `2025_0001_init.sql`, run
3) Paste `2025_0002_seed_lookups.sql`, run

Notes
- RLS is enabled; public read allowed for reference data.
- Profiles and all user-owned data are restricted to `auth.uid()`.
- `v_aggregated_shopping_list` provides on-the-fly combined ingredients per meal plan.
