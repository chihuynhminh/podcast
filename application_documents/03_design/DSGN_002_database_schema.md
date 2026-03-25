# DSGN_002: Database Schema & Data Model

**Document Type:** Design
**Status:** Active
**Created:** 2026-03-24

---

## 1. Schema Overview

The Music Management application uses 6 core tables in PostgreSQL:

1. **users** - User profiles (managed by Supabase Auth)
2. **songs** - Song library (local files + URLs)
3. **playlists** - User playlists
4. **playlist_songs** - Songs in playlists (many-to-many junction table)
5. **playback_positions** - Playback resume data
6. **playlist_shares** - Playlist sharing access control

---

## 2. Table Definitions

### Table 1: users

**Purpose:** User profiles (created and managed by Supabase Auth)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, FK to auth.users(id) | User ID from Supabase Auth |
| `email` | TEXT | UNIQUE, NOT NULL | User email address |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Account creation time |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Last profile update |

**Notes:**
- Row Level Security (RLS): Users can only read their own profile
- Supabase Auth automatically populates `id`, `email`, `created_at`
- Can be extended with additional fields (profile picture, preferences) later

**SQL:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);
```

---

### Table 2: songs

**Purpose:** Metadata for all songs in user's library (local files + streaming URLs)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique song ID |
| `user_id` | UUID | NOT NULL, FK songs(user_id) → users(id) | Owner of this song |
| `title` | TEXT | NOT NULL | Song title |
| `artist` | TEXT | | Artist name (optional) |
| `source_type` | TEXT | NOT NULL, CHECK (source_type IN ('local_file', 'url')) | 'local_file' or 'url' |
| `file_path` | TEXT | | Path in Supabase Storage if local file (NULL if URL) |
| `url` | TEXT | NOT NULL | Accessible URL (Supabase Storage URL or HTTPS URL) |
| `duration_seconds` | INTEGER | | Total duration in seconds (optional, for display) |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | When song was added |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Last metadata update |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `user_id` (for fast filtering by user)
- UNIQUE INDEX on `(user_id, title)` (optional, to prevent duplicates)

**Notes:**
- `title` and `artist` extracted from file metadata or entered manually
- `file_path` = NULL for streaming URLs, populated only for uploaded files
- `url` contains either the Supabase Storage signed URL or external HTTPS URL
- `duration_seconds` can be calculated client-side or extracted from file metadata

**SQL:**
```sql
CREATE TABLE songs (
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

CREATE INDEX idx_songs_user_id ON songs(user_id);
CREATE UNIQUE INDEX idx_songs_user_title ON songs(user_id, title);

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own songs"
  ON songs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### Table 3: playlists

**Purpose:** User's playlists (can be private or shared)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique playlist ID |
| `user_id` | UUID | NOT NULL, FK → users(id) | Owner of this playlist |
| `name` | TEXT | NOT NULL | Playlist name |
| `description` | TEXT | | Playlist description (optional) |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | When playlist was created |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Last edit time |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `user_id`

**Notes:**
- Playlist ownership determines who can edit it
- Sharing is managed via separate `playlist_shares` table
- Deleting a playlist cascades to remove all songs from that playlist (via FK)

**SQL:**
```sql
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own playlists"
  ON playlists FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM playlist_shares WHERE playlist_id = id AND shared_with_user_id = auth.uid())
  );

CREATE POLICY "Users can insert own playlists"
  ON playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists"
  ON playlists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists"
  ON playlists FOR DELETE
  USING (auth.uid() = user_id);
```

---

### Table 4: playlist_songs

**Purpose:** Junction table linking songs to playlists with ordering

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique record ID |
| `playlist_id` | UUID | NOT NULL, FK → playlists(id) | Which playlist |
| `song_id` | UUID | NOT NULL, FK → songs(id) | Which song |
| `position` | INTEGER | NOT NULL | Order position in playlist (1, 2, 3, ...) |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | When song was added to playlist |

**Unique Constraint:**
- UNIQUE on `(playlist_id, song_id)` - prevent same song twice in one playlist

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `playlist_id` (for fast "get all songs in playlist")
- INDEX on `song_id` (for fast "get all playlists with this song")
- UNIQUE INDEX on `(playlist_id, song_id)`

**Notes:**
- `position` determines playback order (updated on drag-and-drop)
- Songs are stored once in `songs` table; `playlist_songs` is just a reference
- Deleting a song cascades to remove it from all playlists

**SQL:**
```sql
CREATE TABLE playlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

CREATE INDEX idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_song_id ON playlist_songs(song_id);

ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage songs in own playlists"
  ON playlist_songs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM playlists WHERE id = playlist_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM playlists WHERE id = playlist_id AND user_id = auth.uid())
  );
```

---

### Table 5: playback_positions

**Purpose:** Track where user stopped playing each song in each playlist (for resume feature)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique record ID |
| `user_id` | UUID | NOT NULL, FK → users(id) | Which user |
| `song_id` | UUID | NOT NULL, FK → songs(id) | Which song |
| `playlist_id` | UUID | NOT NULL, FK → playlists(id) | Which playlist they were playing |
| `current_time_seconds` | FLOAT | NOT NULL, DEFAULT 0 | Playback position in seconds |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Last time position was updated |

**Unique Constraint:**
- UNIQUE on `(user_id, song_id, playlist_id)` - one position per user-song-playlist combo

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `(user_id, song_id, playlist_id)`
- INDEX on `user_id` (for fast "get all playback positions for user")

**Notes:**
- Each user tracks progress independently (even in shared playlists)
- `current_time_seconds` is a float to allow fractional seconds (HH:MM:SS.MMM)
- When user plays a song, fetch this record and set HTML5 audio.currentTime
- Auto-save via `UPSERT` every 5-10 seconds while playback is active
- DELETE old records (e.g., older than 90 days) if cleanup is needed

**SQL:**
```sql
CREATE TABLE playback_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  current_time_seconds FLOAT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, song_id, playlist_id)
);

CREATE UNIQUE INDEX idx_playback_positions_user_song_playlist
  ON playback_positions(user_id, song_id, playlist_id);
CREATE INDEX idx_playback_positions_user_id ON playback_positions(user_id);

ALTER TABLE playback_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own playback positions"
  ON playback_positions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### Table 6: playlist_shares

**Purpose:** Track which playlists are shared with which users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique share record ID |
| `playlist_id` | UUID | NOT NULL, FK → playlists(id) | Which playlist is shared |
| `shared_by_user_id` | UUID | NOT NULL, FK → users(id) | Who owns/shared the playlist |
| `shared_with_user_id` | UUID | NOT NULL, FK → users(id) | Who it's shared with |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | When it was shared |

**Unique Constraint:**
- UNIQUE on `(playlist_id, shared_with_user_id)` - prevent duplicate shares

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `playlist_id`
- INDEX on `shared_with_user_id` (for fast "get all playlists shared with me")
- UNIQUE INDEX on `(playlist_id, shared_with_user_id)`

**Notes:**
- Only playlist owner can INSERT (create a share)
- Recipients can SELECT to see what's shared with them
- Recipients can't UPDATE or DELETE (only owner can unshare)
- Removing this record revokes access
- Shared playlists are read-only (recipients can't edit songs or order)

**SQL:**
```sql
CREATE TABLE playlist_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  shared_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, shared_with_user_id)
);

CREATE INDEX idx_playlist_shares_playlist_id ON playlist_shares(playlist_id);
CREATE INDEX idx_playlist_shares_shared_with_user_id ON playlist_shares(shared_with_user_id);

ALTER TABLE playlist_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can create shares"
  ON playlist_shares FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM playlists WHERE id = playlist_id AND user_id = auth.uid())
  );

CREATE POLICY "Recipients can see shares"
  ON playlist_shares FOR SELECT
  USING (
    shared_with_user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM playlists WHERE id = playlist_id AND user_id = auth.uid())
  );

CREATE POLICY "Only owners can unshare"
  ON playlist_shares FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM playlists WHERE id = playlist_id AND user_id = auth.uid())
  );
```

---

## 3. Entity Relationship Diagram

```
┌──────────────┐
│    users     │
├──────────────┤
│ id (PK)      │
│ email        │
│ created_at   │
└──────────────┘
      ▲
      │ (1)
      │
    (N)
      │
      ├─────────────────────────────────────┐
      │                                     │
      │                                     │
   (FK)                                  (FK)
   owns                              receives share
      │                                     │
      ▼                                     ▼
┌──────────────┐                     ┌─────────────────┐
│  playlists   │◄───────(shares)─────│ playlist_shares │
├──────────────┤                     ├─────────────────┤
│ id (PK)      │                     │ id (PK)         │
│ user_id (FK) │                     │ playlist_id(FK) │
│ name         │                     │ shared_by_user  │
│ description  │                     │ shared_with_user│
└──────────────┘                     └─────────────────┘
      │
      │ (1)
      │
    (N)
    contains
      │
      ▼
┌────────────────────┐
│ playlist_songs     │
├────────────────────┤
│ id (PK)            │
│ playlist_id (FK)◄──┘
│ song_id (FK)───┐
│ position       │ references
└────────────────┘
                 │
                 │ (M)
                 │
                 ▼
         ┌──────────────┐
         │    songs     │
         ├──────────────┤
         │ id (PK)      │
         │ user_id (FK)─┼──┐
         │ title        │  │
         │ artist       │  │
         │ source_type  │  │
         │ file_path    │  │
         │ url          │  │
         │ duration     │  │
         └──────────────┘  │
                           │
                           ▼
                    ┌────────────────────┐
                    │ playback_positions │
                    ├────────────────────┤
                    │ id (PK)            │
                    │ user_id (FK)───────┼──┐
                    │ song_id (FK)───────┼──(user tracks progress)
                    │ playlist_id(FK)    │  │
                    │ current_time       │  │
                    │ updated_at         │  │
                    └────────────────────┘  │
                                            │
                                            ▼ (back to users)
```

---

## 4. Data Integrity Rules

### Foreign Key Constraints
- `songs.user_id` → `users.id` (ON DELETE CASCADE)
- `playlists.user_id` → `users.id` (ON DELETE CASCADE)
- `playlist_songs.playlist_id` → `playlists.id` (ON DELETE CASCADE)
- `playlist_songs.song_id` → `songs.id` (ON DELETE CASCADE)
- `playback_positions.user_id` → `users.id` (ON DELETE CASCADE)
- `playback_positions.song_id` → `songs.id` (ON DELETE CASCADE)
- `playback_positions.playlist_id` → `playlists.id` (ON DELETE CASCADE)
- `playlist_shares.playlist_id` → `playlists.id` (ON DELETE CASCADE)
- `playlist_shares.shared_by_user_id` → `users.id` (ON DELETE CASCADE)
- `playlist_shares.shared_with_user_id` → `users.id` (ON DELETE CASCADE)

**Impact:** Deleting a user cascades to delete all their playlists, songs, playback positions, and shares.

### Unique Constraints
- `users.email` - Prevent duplicate email addresses
- `songs(user_id, title)` - Prevent duplicate song titles per user (optional)
- `playlist_songs(playlist_id, song_id)` - Prevent same song twice in one playlist
- `playback_positions(user_id, song_id, playlist_id)` - One position per user-song-playlist combo
- `playlist_shares(playlist_id, shared_with_user_id)` - Prevent duplicate shares of same playlist to same user

---

## 5. Row-Level Security (RLS) Policies

### Summary of RLS in Force

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| users | Own only | Disabled | Own only | Disabled |
| songs | Own only | Own only | Own only | Own only |
| playlists | Own + shared | Own only | Own only | Own only |
| playlist_songs | Own playlist | Own playlist | Own playlist | Own playlist |
| playback_positions | Own only | Own only | Own only | Own only |
| playlist_shares | See own/received | Owner only | Disabled | Owner only |

### How Sharing Works with RLS

**For Private Playlist:**
```
User A can SELECT their own playlists
User B cannot SELECT User A's playlists
```

**After User A Shares Playlist X with User B:**
```
entry in playlist_shares: (playlist_id=X, shared_with_user_id=B)

User A: SELECT playlists WHERE user_id = A  ✓
User B: SELECT playlists WHERE user_id = A  ✗
User B: SELECT playlists WHERE shared_with_user_id = B  ✓ (can see X)

But for INSERT/UPDATE/DELETE on playlist X:
User A: Can (owns it)
User B: Cannot (RLS blocks)
```

---

## 6. Indexes for Performance

**Primary Indexes (created with PRIMARY KEY):**
- All tables: `id` (primary key)

**Foreign Key Indexes (created with REFERENCES):**
- `songs.user_id`
- `playlists.user_id`
- `playlist_songs.playlist_id`
- `playlist_songs.song_id`
- `playback_positions.user_id`
- `playback_positions.song_id`
- `playback_positions.playlist_id`
- `playlist_shares.playlist_id`
- `playlist_shares.shared_with_user_id`

**Query Optimization Indexes:**
- `songs(user_id)` - for "get all songs belonging to user"
- `playlists(user_id)` - for "get all playlists of user"
- `playback_positions(user_id)` - for "get all positions of user"

**Unique Indexes (for constraints):**
- `playback_positions(user_id, song_id, playlist_id)` - UNIQUE
- `playlist_shares(playlist_id, shared_with_user_id)` - UNIQUE

---

## 7. Sample Data & Queries

### Example: Adding a Song to Library

```typescript
// Backend: Create songs record
const { data, error } = await supabase
  .from('songs')
  .insert({
    user_id: 'user-123',
    title: 'My Favorite Song',
    artist: 'Artist Name',
    source_type: 'local_file',
    file_path: 'users/user-123/songs/favorite.mp3',
    url: 'https://supabase.project.com/storage/v1/object/public/songs/users/user-123/songs/favorite.mp3',
    duration_seconds: 240
  });
```

### Example: Adding Song to Playlist

```typescript
// Get max position in playlist
const { data: existing } = await supabase
  .from('playlist_songs')
  .select('position')
  .eq('playlist_id', 'playlist-456')
  .order('position', { ascending: false })
  .limit(1);

const nextPosition = (existing[0]?.position ?? 0) + 1;

// Insert the song
const { data, error } = await supabase
  .from('playlist_songs')
  .insert({
    playlist_id: 'playlist-456',
    song_id: 'song-123',
    position: nextPosition
  });
```

### Example: Saving Playback Position

```typescript
// Upsert (insert or update) playback position
const { data, error } = await supabase
  .from('playback_positions')
  .upsert({
    user_id: 'user-123',
    song_id: 'song-123',
    playlist_id: 'playlist-456',
    current_time_seconds: 145.5
  });
```

### Example: Get Songs in Playlist (with order)

```typescript
const { data: songs } = await supabase
  .from('playlist_songs')
  .select('*, songs(*)')
  .eq('playlist_id', 'playlist-456')
  .order('position');

// Returns: [ { song_id, songs: { title, artist, url }, position }, ... ]
```

### Example: Get Shared Playlists for User

```typescript
const { data: sharedPlaylists } = await supabase
  .from('playlist_shares')
  .select('*, playlists(*)')
  .eq('shared_with_user_id', 'user-456');

// Returns: [ { playlist_id, playlists: { name, songs_count }, ... }, ... ]
```

---

## 8. Migration Notes (for Supabase)

### Initial Setup
1. Create tables in order of dependencies (users → playlists, songs → playlist_songs, playback_positions)
2. Enable RLS on all tables
3. Create RLS policies as defined above
4. Create indexes for performance
5. Test policies with sample data

### Backup & Recovery
- Supabase provides automatic daily backups
- Set up point-in-time recovery (PITR) for production
- Export critical tables weekly

---

**Cross-References:**
- `DSGN_001_system_architecture.md` - Service layer that interfaces with these tables
- `DSGN_003_ui_design.md` - UI that displays/modifies this data
- `FEAT_001_playlist_management.md` - How playlists and playlist_songs are managed
- `FEAT_003_file_upload.md` - How file_path and url are populated for songs

**Last Updated:** 2026-03-24
**Status:** Approved
