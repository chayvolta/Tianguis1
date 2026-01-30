-- ==============================================
-- SUPABASE SCHEMA FOR GEOPORTAL GAMIFICATION
-- ==============================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- PROFILES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  total_points INT DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles (for leaderboard)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ==============================================
-- CHECKINS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  site_id INT NOT NULL,
  site_name TEXT NOT NULL,
  photo_url TEXT,
  qr_validated BOOLEAN DEFAULT FALSE,
  points_earned INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One check-in per user per site
  UNIQUE(user_id, site_id)
);

-- Enable RLS
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Users can read all checkins (for stats)
CREATE POLICY "Checkins are viewable by everyone"
  ON checkins FOR SELECT
  USING (true);

-- Users can only insert their own checkins
CREATE POLICY "Users can insert own checkins"
  ON checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==============================================
-- BADGES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT '🏆',
  requirement_type TEXT NOT NULL, -- 'sites_count', 'category', 'special'
  requirement_value INT,
  points_value INT DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (badges are read-only for users)
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone"
  ON badges FOR SELECT
  USING (true);

-- ==============================================
-- INSERT DEFAULT BADGES
-- ==============================================
INSERT INTO badges (name, description, icon, requirement_type, requirement_value, points_value)
VALUES 
  ('Explorador Novato', 'Visita 3 sitios históricos', '🌟', 'sites_count', 3, 50),
  ('Aventurero', 'Visita 5 sitios históricos', '🧭', 'sites_count', 5, 100),
  ('Historiador', 'Visita 10 sitios históricos', '📚', 'sites_count', 10, 200),
  ('Coleccionista', 'Completa los 15 sitios', '👑', 'sites_count', 15, 500),
  ('Madrugador', 'Realiza un check-in antes de las 9am', '🌅', 'special', 0, 25)
ON CONFLICT (name) DO NOTHING;

-- ==============================================
-- FUNCTION: Update user points after checkin
-- ==============================================
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    total_points = total_points + NEW.points_earned,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update points on new checkin
DROP TRIGGER IF EXISTS on_checkin_created ON checkins;
CREATE TRIGGER on_checkin_created
  AFTER INSERT ON checkins
  FOR EACH ROW EXECUTE FUNCTION update_user_points();

-- ==============================================
-- FUNCTION: Auto-create profile on user signup
-- ==============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
