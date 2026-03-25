# DSGN_001: System Architecture Overview

**Document Type:** Design
**Status:** Active
**Created:** 2026-03-24

---

## 1. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Pages (Static Hosting)             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           React Application (Frontend)                   │    │
│  │  - Login Component                                       │    │
│  │  - Dashboard + Sidebar                                  │    │
│  │  - Playlists View & Songs View                          │    │
│  │  - Music Player (with controls)                         │    │
│  │  - Modals (Add/Edit/Share dialogs)                      │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────────────────────┘
                   │ HTTPS REST API Calls
                   │ (via Supabase SDK)
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase (Backend)                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Authentication (Supabase Auth)                          │    │
│  │ - JWT Token Generation & Validation                     │    │
│  │ - User Session Management                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ PostgreSQL Database                                     │    │
│  │ - users, songs, playlists, playlist_songs              │    │
│  │ - playback_positions, playlist_shares                  │    │
│  │ - Row-Level Security (RLS) policies                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Object Storage (Supabase Storage)                       │    │
│  │ - users/{user_id}/songs/{filename} - uploaded files    │    │
│  │ - Public/authenticated URLs for playback               │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                   │
                   ↓ Returns Signed URLs
         ┌──────────────────────────┐
         │  External Audio Sources  │
         │  - HTTPS URLs (Spotify,  │
         │    YouTube Music, etc.)  │
         └──────────────────────────┘
```

---

## 2. Frontend Architecture

### Technology Stack
- **Framework:** React 18+
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** CSS3 (optional: TailwindCSS or styled-components)
- **State Management:** Component-level state + Supabase SDK

### Why These Choices?
- **React:** Component-based, large ecosystem, excellent for SPAs
- **TypeScript:** Type safety prevents runtime errors, better IDE support
- **Vite:** Fast dev server, optimized production builds, minimal config
- **Supabase SDK:** Built-in support for auth, database, storage - no extra HTTP layer needed

### Frontend Dependencies

**Core:**
- `react` 18+
- `typescript` 5+
- `react-router-dom` (for page navigation)

**Backend Integration:**
- `@supabase/supabase-js` (SDK for all Supabase services)

**UI & Interaction:**
- `react-beautiful-dnd` or `react-dnd` (drag-and-drop reordering)
- `uuid` (generate UUIDs for database records)

**Optional Enhancements:**
- `tailwindcss` (utility-first CSS framework)
- `react-icons` (icon library)
- `recharts` (if adding charts later)

---

## 3. Backend Architecture (Supabase)

### Supabase Services Used

**1. Authentication (Supabase Auth)**
- JWT-based authentication
- Magic link or password-based sign-in
- User profiles linked to PostgreSQL `users` table
- Session management via JWT tokens

**2. PostgreSQL Database**
   - 6 core tables with relationships (see DSGN_002)
   - Row-Level Security (RLS) policies enforce authorization
   - Relational integrity via foreign keys
   - Timestamp fields for audit trail

**3. Object Storage (Supabase Storage)**
   - S3-compatible API
   - File Organization: `users/{user_id}/songs/{filename}`
   - Automatic URL generation for uploaded files
   - Signed URLs for authenticated access (expiring URLs)
   - Resumable uploads for large files

### Why Supabase Over Raw SQL?
- ✅ Managed PostgreSQL (no ops)
- ✅ Built-in authentication (JWT tokens)
- ✅ Object storage (file management)
- ✅ Real-time subscriptions (optional for future features)
- ✅ SQL API exposure for complex queries
- ✅ Automatic backups and disaster recovery
- ✅ Row-Level Security for fine-grained access control

---

## 4. Data Flow Diagram

### User Login Flow
```
User enters credentials → React LoginPage
        ↓
    Calls Supabase Auth.signIn()
        ↓
    Supabase validates credentials → Returns JWT token
        ↓
    React stores JWT token in localStorage/sessionStorage
        ↓
    Redirect to Dashboard
        ↓
    React fetches user's playlists with auth token
        ↓
    Display Playlists & Songs views
```

### Music Upload & Play Flow
```
User clicks "Add Song" → "Upload local file"
        ↓
    File picker dialog opens
        ↓
    React extracts file metadata (title, artist)
        ↓
    Supabase.storage.upload() uploads file
        ↓
    Supabase returns signed URL for file
        ↓
    React creates "songs" record in database
        ↓
    Song added to library
        ↓
    User clicks song to play
        ↓
    React loads playback_position (if exists)
        ↓
    HTML5 <audio> element plays song from URL
        ↓
    Auto-save position every 5-10 seconds
```

### Playlist Sharing Flow
```
Owner clicks "Share Playlist"
        ↓
    Modal prompts for recipient email
        ↓
    React creates "playlist_shares" record
        ↓
    Supabase RLS allows owner to write
        ↓
    Recipient logs in
        ↓
    React queries playlists + shared playlists
        ↓
    Shared playlist appears in "Shared with Me"
        ↓
    Recipient can play but not edit (RLS enforces)
```

---

## 5. Component Architecture

### Component Hierarchy

```
<App>
├── <LoginPage> (auth route)
├── <Dashboard> (protected, multi-segment layout)
│   ├── <Sidebar> (navigation: Playlists / Songs)
│   ├── <MainContent> (dynamic, based on sidebar selection)
│   │   ├── <PlaylistsView> (when "Playlists" selected)
│   │   │   ├── <PlaylistCard> (× N, each playlist)
│   │   │   │   ├── Edit button → <EditPlaylistModal>
│   │   │   │   ├── Delete button
│   │   │   │   ├── Share button → <SharePlaylistModal>
│   │   │   │   └── Click to expand → <PlaylistDetail>
│   │   │   ├── <PlaylistDetail>
│   │   │   │   └── <SongList> (drag-and-drop reorderable)
│   │   │   │       ├── <SongItem> (× N)
│   │   │   │       │   └── Click to play
│   │   │   │       └── <DeleteSongButton>
│   │   │   └── <AddPlaylistModal>
│   │   │
│   │   └── <SongsView> (when "Songs" selected)
│   │       ├── <SongCard> (× N, each song in library)
│   │       │   ├── Edit button → <EditSongModal>
│   │       │   └── Delete button
│   │       ├── <AddSongModal>
│   │       │   ├── <UploadLocalFileForm>
│   │       │   └── <AddUrlForm>
│   │       └── <SharePlaylistModal>
│   │
│   └── <MusicPlayer> (always at bottom)
│       ├── <SongInfo> (current title, artist, playlist)
│       ├── <PlayerControls>
│       │   ├── <PlayPauseButton>
│       │   ├── <PrevButton>
│       │   ├── <NextButton>
│       │   ├── <RepeatModeButton>
│       │   └── <ShuffleButton>
│       ├── <ProgressBar>
│       │   ├── <TimeDisplay>
│       │   └── <DurationDisplay>
│       └── <VolumeControl>
```

---

## 6. State Management Strategy

### Component-Level State (Recommended)

**Why minimal state management?**
- App has relatively simple state (playlists, songs, current playback)
- Supabase SDK handles most state via its built-in caching
- Avoid over-engineering with Redux/Context for this small scope

### State Flow

**Global State Needed:**
- Current user (from Supabase Auth)
- Current playlist being viewed
- Current song playing
- Is playing / paused
- Current playback time
- Volume level

**Implementation:**
- Store in React component state using `useState`
- Pass via props to child components
- OR use React Context API for deeply nested components
- Fetch playlist/song data from Supabase on demand

**Example State in MusicPlayer:**
```typescript
const [currentSong, setCurrentSong] = useState<Song | null>(null);
const [isPlaying, setIsPlaying] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [volume, setVolume] = useState(1);
const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
const [isShuffle, setIsShuffle] = useState(false);
```

---

## 7. Service Layer Architecture

### Services (Encapsulate Supabase Logic)

Create separate service files to keep components clean:

**supabaseClient.ts** - Initialize Supabase client
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**authService.ts** - User authentication
```typescript
export const login = (email, password) => supabase.auth.signInWithPassword(email, password);
export const logout = () => supabase.auth.signOut();
export const getCurrentUser = () => supabase.auth.getUser();
```

**playlistService.ts** - Playlist operations
```typescript
export const getPlaylists = (userId) => supabase.from('playlists').select('*').eq('user_id', userId);
export const createPlaylist = (userId, name) => supabase.from('playlists').insert({ user_id: userId, name });
export const deletePlaylist = (playlistId) => supabase.from('playlists').delete().eq('id', playlistId);
export const getPlaylistSongs = (playlistId) => supabase.from('playlist_songs').select('*, songs(*)').eq('playlist_id', playlistId).order('position');
```

**songService.ts** - Song operations
```typescript
export const getSongs = (userId) => supabase.from('songs').select('*').eq('user_id', userId);
export const uploadFile = (userId, file) => supabase.storage.from('songs').upload(`users/${userId}/songs/${file.name}`, file);
export const deleteSong = (songId) => supabase.from('songs').delete().eq('id', songId);
```

**playerService.ts** - Playback position
```typescript
export const getPlaybackPosition = (userId, songId, playlistId) => supabase.from('playback_positions').select('*').eq('user_id', userId).eq('song_id', songId).eq('playlist_id', playlistId);
export const savePlaybackPosition = (userId, songId, playlistId, currentTime) => supabase.from('playback_positions').upsert({ user_id: userId, song_id: songId, playlist_id: playlistId, current_time_seconds: currentTime });
```

**shareService.ts** - Playlist sharing
```typescript
export const sharePlaylist = (playlistId, ownerUserId, recipientEmail) => /* query to find recipient, create share record */;
export const getSharedPlaylists = (userId) => /* query playlist_shares where shared_with_user_id = userId */;
export const unsharePlaylist = (shareId) => supabase.from('playlist_shares').delete().eq('id', shareId);
```

---

## 8. Error Handling Strategy

### Client-Side Error Handling

**Authentication Errors:**
- Invalid credentials → Show "Email or password incorrect" message
- Network error → Retry with exponential backoff
- Token expired → Redirect to login

**Database Errors:**
- Duplicate key → Show "Item already exists" message
- RLS violation → Show "You don't have permission" message
- Network timeout → Show "Connection lost, retrying..."

**File Upload Errors:**
- File too large → Show "File exceeds size limit"
- Invalid file type → Show "Only audio files supported"
- Storage quota exceeded → Show "Storage full, delete some songs"

**Playback Errors:**
- URL unavailable → Auto-skip to next song, show notification
- Network loss during playback → Pause with "Network error" message
- Unsupported audio format → Skip with notification

### Error Logging
- Log all errors to browser console (dev)
- Optional: Send critical errors to monitoring service (Sentry, LogRocket)

---

## 9. Security Architecture

### Authentication
- Supabase Auth handles JWT token generation
- Tokens stored in browser localStorage/sessionStorage
- Token includes `sub` (user ID) and `role` (public)
- Auto-expires after configured TTL (typically 1 hour)

### Authorization (Row-Level Security)
- Database enforces all access control via RLS policies
- Frontend checks user permissions before UI interactions
- No "security by obscurity" - backend is the source of truth

### Data Privacy
- User data is NOT shared between users by default
- Shared playlists are opt-in (user explicitly shares)
- File uploads are stored with user ID in path (users/{user_id}/songs/)
- No personal data in environment variables (only public Supabase keys)

### HTTPS & Transport Security
- All API calls use HTTPS (enforced by Supabase)
- Audio streaming from HTTPS URLs only (no HTTP due to browser CORS restrictions)

---

## 10. Deployment Architecture

### Development Environment
```
Local Machine
├── Node.js + npm
├── React Dev Server (via Vite)
├── Code: TypeScript + React
├── Environment: .env.local (contains Supabase test project keys)
└── Testing: Jest + React Testing Library
```

### Production Environment
```
GitHub Pages (Static Hosting)
├── Build artifact: dist/ folder
├── Served via CDN (GitHub Pages CDN)
├── HTTPS enabled (automatic)
├── Environment: GitHub Secrets contain VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (injected at build time)
└── CI/CD: GitHub Actions workflow
```

### GitHub Actions Workflow
```
Commit to main branch
        ↓
    GitHub Actions triggers
        ↓
    Install dependencies (npm install)
        ↓
    Run tests (npm test)
        ↓
    Build (npm run build) → dist/
        ↓
    Deploy dist/ to gh-pages branch
        ↓
    GitHub Pages serves from gh-pages
```

---

## 11. Scalability Considerations

### Database Scalability
- Supabase Free tier: up to 500 MB storage
- Sufficient for ~10,000 song metadata records
- Scales to Production tier for larger datasets
- RLS policies scale linearly with users

### Storage Scalability
- Supabase Storage: Auto-scales with file uploads
- Cost: $0.10 per GB/month for storage, $0.025 per GB for bandwidth
- Sufficient for personal/small team use

### Frontend Scalability
- GitHub Pages: Unlimited bandwidth, scales globally via CDN
- React app size: ~30-50 KB gzipped (comfortable for low-bandwidth scenarios)

### API Scalability
- Supabase REST API: Rate limits ~500 requests/second per project (free tier)
- Sufficient for thousands of concurrent users
- Can upgrade to Production tier for higher limits

---

## 12. Technology Decision Rationale

| **Decision** | **Alternative** | **Why We Chose This** |
|---|---|---|
| React | Vue, Svelte | Larger ecosystem, more job market demand, mature |
| Supabase | Firebase, AWS Amplify | Lower cost, transparent pricing, SQL-first, uses PostgreSQL |
| GitHub Pages | Vercel, Netlify | Free, simple GitHub integration, no vendor lock-in |
| PostgreSQL | MongoDB, DynamoDB | Relational model fits playlists well, SQL queries powerful |
| Vite | Create React App | Faster dev server, faster builds, easier to extend |
| TypeScript | JavaScript | Catch errors early, better IDE support, long-term maintenance |

---

## 13. Future Architecture Enhancements

### Potential Future Additions (Post-MVP)
- **Real-time Sync:** Use Supabase Realtime to sync playlists across tabs/devices
- **Offline Mode:** Use Service Worker + IndexedDB for offline playback
- **Progressive Web App (PWA):** Add install-on-home-screen support
- **Recommendations:** ML-based song suggestions (future feature)
- **Analytics:** Track listening patterns (optional, user can disable)
- **Social Features:** Follow users, see their playlists (future)

---

**Cross-References:**
- `DSGN_002_database_schema.md` - Complete database design
- `DSGN_003_ui_design.md` - UI layout details
- `SETUP_001_environment_config.md` - Development setup

**Last Updated:** 2026-03-24
**Status:** Approved
