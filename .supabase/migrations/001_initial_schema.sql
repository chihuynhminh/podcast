-- Music Manager Database Schema
-- Initial setup with 6 core tables and indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- Table 1: users (linked to Supabase auth.users)
-- ================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- ================================================================
-- Table 2: songs
-- ================================================================
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('local_file', 'url')),
  file_path TEXT,
  url TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_songs_user_title ON songs(user_id, title);

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can CRUD own songs"
  ON songs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- Table 3: playlists
-- ================================================================
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can read own and shared playlists"
  ON playlists FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM playlist_shares
      WHERE playlist_id = id
        AND shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can insert own playlists"
  ON playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own playlists"
  ON playlists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own playlists"
  ON playlists FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- Table 4: playlist_songs (junction table)
-- ================================================================
CREATE TABLE IF NOT EXISTS playlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_song_id ON playlist_songs(song_id);

ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage songs in own playlists"
  ON playlist_songs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id AND user_id = auth.uid()
    )
  );

-- ================================================================
-- Table 5: playback_positions
-- ================================================================
CREATE TABLE IF NOT EXISTS playback_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  current_time_seconds FLOAT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, song_id, playlist_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_playback_positions_user_song_playlist
  ON playback_positions(user_id, song_id, playlist_id);
CREATE INDEX IF NOT EXISTS idx_playback_positions_user_id ON playback_positions(user_id);

ALTER TABLE playback_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can CRUD own playback positions"
  ON playback_positions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- Table 6: playlist_shares
-- ================================================================
CREATE TABLE IF NOT EXISTS playlist_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  shared_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, shared_with_user_id)
);

CREATE INDEX IF NOT EXISTS idx_playlist_shares_playlist_id ON playlist_shares(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_shares_shared_with_user_id ON playlist_shares(shared_with_user_id);

ALTER TABLE playlist_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Owners can create shares"
  ON playlist_shares FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id AND user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Recipients can see shares"
  ON playlist_shares FOR SELECT
  USING (
    shared_with_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id AND user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Only owners can unshare"
  ON playlist_shares FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id AND user_id = auth.uid()
    )
  );

-- ================================================================
-- Setup complete
-- All 6 tables created with indexes and RLS policies
-- ================================================================
