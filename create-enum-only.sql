-- Create the invite_status enum first
DO $$ BEGIN
    CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired', 'revoked', 'waitlist');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;