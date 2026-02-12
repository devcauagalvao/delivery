-- Add owner DELETE policy for profiles (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can delete own profile'
  ) THEN
    CREATE POLICY "Users can delete own profile"
      ON profiles FOR DELETE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END$$;
