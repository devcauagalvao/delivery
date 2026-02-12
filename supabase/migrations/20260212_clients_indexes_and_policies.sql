-- Migration: Add indexes and admin RLS for `profiles` (clients management)
-- Idempotent: safe to run multiple times

-- 1) pg_trgm extension (for fast ILIKE / trigram search)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    CREATE EXTENSION pg_trgm;
  END IF;
END$$;

-- 2) Indexes for `profiles` (search + pagination)
CREATE INDEX IF NOT EXISTS profiles_full_name_trgm_idx ON profiles USING gin (lower(full_name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS profiles_phone_idx ON profiles (phone);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles (created_at DESC);

-- 3) Ensure updated_at trigger exists (already provided in previous migration but keep safe)
-- Function `update_updated_at` expected to exist; do not recreate if exists

-- 4) Add/ensure admin policies for full CRUD on profiles
-- Allow authenticated admin (profiles.role = 'admin') to SELECT/INSERT/UPDATE/DELETE

-- SELECT (already exists in older migration, but keep idempotent check)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Admins can read all profiles'::text
  ) THEN
    CREATE POLICY "Admins can read all profiles"
      ON profiles FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END$$;

-- INSERT
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Admins can insert profiles'
  ) THEN
    CREATE POLICY "Admins can insert profiles"
      ON profiles FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END$$;

-- UPDATE
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Admins can update profiles'
  ) THEN
    CREATE POLICY "Admins can update profiles"
      ON profiles FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END$$;

-- DELETE
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Admins can delete profiles'
  ) THEN
    CREATE POLICY "Admins can delete profiles"
      ON profiles FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END$$;

-- 5) Safety: make sure no constraint prevents inserting/updating typical customer rows
-- full_name is NOT NULL by design; keep that. phone may be NULL.
-- No changes to table columns are made here (per instructions to avoid inventing fields).

-- 6) Example GRANTs for service role usage (no-op if roles already set)
-- (Supabase service role will use service key; no DB role change required)

-- Done
