# IMPL_001: Phase 1 Foundation - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up React + TypeScript + Vite project, initialize Supabase database schema, implement user authentication, and deploy skeleton to GitHub Pages.

**Architecture:** Foundation phase establishes the core infrastructure: a Vite-based React SPA with component-level state, Supabase backend with 6-table schema and RLS policies, and GitHub Actions CI/CD for GitHub Pages deployment.

**Tech Stack:** React 18+, TypeScript 5+, Vite, Supabase, GitHub Pages, GitHub Actions

**Estimated Duration:** 8-10 hours (6 tasks × 1.5 hours average)

---

## File Structure & Organization

```
frontend/
├── src/
│   ├── components/
│   │   ├── LoginPage.tsx         # Auth UI
│   │   ├── Dashboard.tsx          # Main layout wrapper
│   │   ├── Sidebar.tsx            # Navigation menu
│   │   ├── MainContent.tsx        # Dynamic content area
│   │   ├── MusicPlayer.tsx        # Bottom player bar
│   │   └── modals/
│   │       ├── AddPlaylistModal.tsx
│   │       └── AddSongModal.tsx
│   ├── services/
│   │   ├── supabaseClient.ts      # Client initialization
│   │   ├── authService.ts         # Auth functions
│   │   ├── playlistService.ts     # Playlist CRUD
│   │   ├── songService.ts         # Song CRUD
│   │   └── playerService.ts       # Playback position
│   ├── hooks/
│   │   ├── useAuth.ts             # Auth state & logic
│   │   ├── usePlaylists.ts        # Playlist fetching
│   │   └── useSongs.ts            # Song fetching
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   ├── App.tsx                     # Root component
│   ├── App.css                     # Global styles
│   └── main.tsx                    # Entry point
├── public/
│   ├── index.html                  # HTML template
│   └── favicon.ico
├── .env.example
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md

.github/
└── workflows/
    └── deploy.yml                 # GitHub Actions CI/CD

application_documents/
├── 04_setup_and_deployment/
│   ├── SETUP_001_environment_config.md
│   └── DEPLOY_001_github_pages.md
└── (other docs from design phase)
```

---

## Phase 1 Task Breakdown

### Task 1: Project Initialization & Dependencies

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/.gitignore`
- Modify: Root `.gitignore`

**Objective:** Initialize a React 18 + TypeScript + Vite project with all required dependencies.

---

- [ ] **Step 1: Navigate to project and create frontend directory**

```bash
cd /home/ubuntu/Downloads/Podcast_claude
mkdir -p frontend
cd frontend
```

Expected: `frontend/` directory created, current directory is `frontend/`

---

- [ ] **Step 2: Initialize npm project**

```bash
npm init -y
```

Expected: `package.json` created with default metadata

---

- [ ] **Step 3: Update package.json with project metadata and scripts**

Replace the entire `package.json` with:

```json
{
  "name": "music-manager-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && git subtree push --prefix dist origin gh-pages"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@supabase/supabase-js": "^2.38.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

Expected: `package.json` updated with all dependencies and scripts

---

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

Expected: All packages installed, `node_modules/` directory created, `package-lock.json` generated

---

- [ ] **Step 5: Create TypeScript configuration**

Create `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Expected: `tsconfig.json` created with strict TypeScript settings

---

- [ ] **Step 6: Create Vite configuration**

Create `frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    port: 5173,
    open: true
  }
});
```

Expected: `vite.config.ts` created with React plugin configuration

---

- [ ] **Step 7: Create .gitignore for frontend**

Create `frontend/.gitignore`:

```
node_modules/
dist/
.env.local
.env.*.local
*.log
.DS_Store
.vscode/
.idea/
```

Expected: `.gitignore` file created

---

- [ ] **Step 8: Create environment template**

Create `frontend/.env.example`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Expected: `.env.example` created (users will copy to `.env.local`)

---

- [ ] **Step 9: Update root .gitignore**

Add to `/home/ubuntu/Downloads/Podcast_claude/.gitignore`:

```
frontend/.env.local
frontend/.env.*.local
frontend/node_modules/
frontend/dist/
```

Expected: Root `.gitignore` updated with frontend entries

---

- [ ] **Step 10: Commit initialization**

```bash
cd /home/ubuntu/Downloads/Podcast_claude
git add frontend/package.json frontend/package-lock.json frontend/tsconfig.json frontend/vite.config.ts frontend/.gitignore frontend/.env.example .gitignore
git commit -m "chore: initialize React + TypeScript + Vite project

- Add React 18, TypeScript, and Vite configuration
- Configure npm scripts for dev/build/deploy
- Add Supabase and utility dependencies
- Set up .gitignore and environment template"
```

Expected: Commit created with all configuration files

---

### Task 2: Supabase Project Setup & Database Schema

**Files:**
- Create: `.supabase/migrations/001_initial_schema.sql`
- Create: `docs/SUPABASE_SETUP.md` (setup instructions)

**Objective:** Create Supabase project, apply database schema (6 tables), and set up RLS policies.

---

- [ ] **Step 1: Create Supabase project**

Visit https://supabase.com and:
1. Create new project (name: `music-manager`)
2. Save project URL and anon key
3. Store credentials securely (will use in .env.local)

Expected: Supabase project created, credentials obtained

---

- [ ] **Step 2: Create migration file directory**

```bash
mkdir -p /home/ubuntu/Downloads/Podcast_claude/.supabase/migrations
```

Expected: `.supabase/migrations/` directory created

---

- [ ] **Step 3: Create initial schema SQL migration**

Create `.supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (linked to auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create songs table
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

-- Create playlists table
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);

-- Create playlist_songs junction table
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

-- Create playback_positions table
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

-- Create playlist_shares table
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE playback_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_shares ENABLE ROW LEVEL SECURITY;
```

Expected: Migration file created

---

- [ ] **Step 4: Apply RLS policies (via Supabase dashboard SQL editor)**

In Supabase dashboard > SQL Editor, run each policy creation:

**Users Table Policies:**

```sql
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);
```

**Songs Table Policies:**

```sql
CREATE POLICY "Users can CRUD own songs"
  ON songs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Playlists Table Policies:**

```sql
CREATE POLICY "Users can read own and shared playlists"
  ON playlists FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM playlist_shares
      WHERE playlist_id = id
        AND shared_with_user_id = auth.uid()
    )
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

**Playlist_Songs Table Policies:**

```sql
CREATE POLICY "Users can manage songs in own playlists"
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
```

**Playback_Positions Table Policies:**

```sql
CREATE POLICY "Users can CRUD own playback positions"
  ON playback_positions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Playlist_Shares Table Policies:**

```sql
CREATE POLICY "Owners can create shares"
  ON playlist_shares FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Recipients can see shares"
  ON playlist_shares FOR SELECT
  USING (
    shared_with_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Only owners can unshare"
  ON playlist_shares FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id AND user_id = auth.uid()
    )
  );
```

Expected: All RLS policies created in Supabase

---

- [ ] **Step 5: Create Supabase Storage bucket for songs**

In Supabase dashboard > Storage:
1. Create new bucket named `songs`
2. Set as **Private**
3. Save bucket ID

Expected: `songs` bucket created in Supabase Storage

---

- [ ] **Step 6: Create setup documentation**

Create `application_documents/04_setup_and_deployment/SETUP_001_environment_config.md`:

```markdown
# SETUP_001: Environment Configuration

## Supabase Project Setup

1. **Create Supabase Project:**
   - Visit https://supabase.com
   - Click "New Project"
   - Name: "music-manager"
   - Save Region and credentials

2. **Database Schema:**
   - Use SQL Editor to run `.supabase/migrations/001_initial_schema.sql`
   - All 6 tables created with indexes and constraints

3. **Apply RLS Policies:**
   - Follow RLS section in this document
   - 12 total policies across 6 tables

4. **Create Storage Bucket:**
   - Storage > New Bucket
   - Name: "songs"
   - Privacy: Private

5. **Environment Variables:**
   - Copy `frontend/.env.example` to `frontend/.env.local`
   - Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from project settings

## Development Setup

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

App runs at http://localhost:5173
```

Expected: SETUP_001 document created

---

- [ ] **Step 7: Commit database setup**

```bash
git add .supabase/migrations/001_initial_schema.sql application_documents/04_setup_and_deployment/SETUP_001_environment_config.md
git commit -m "chore: initialize Supabase database schema

- Create 6 tables with proper constraints and indexes
- Add RLS policies for multi-user security
- Document setup process in SETUP_001"
```

Expected: Commit created with database schema and documentation

---

### Task 3: Supabase Client Service & Auth Setup

**Files:**
- Create: `frontend/src/services/supabaseClient.ts`
- Create: `frontend/src/services/authService.ts`
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/hooks/useAuth.ts`

**Objective:** Initialize Supabase client, implement authentication service, and create auth hook.

---

- [ ] **Step 1: Create types file**

Create `frontend/src/types/index.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Song {
  id: string;
  user_id: string;
  title: string;
  artist?: string;
  source_type: 'local_file' | 'url';
  file_path?: string;
  url: string;
  duration_seconds?: number;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  position: number;
  created_at: string;
  songs?: Song;
}

export interface PlaybackPosition {
  id: string;
  user_id: string;
  song_id: string;
  playlist_id: string;
  current_time_seconds: number;
  updated_at: string;
}

export interface PlaylistShare {
  id: string;
  playlist_id: string;
  shared_by_user_id: string;
  shared_with_user_id: string;
  created_at: string;
}
```

Expected: `types/index.ts` created with TypeScript interfaces

---

- [ ] **Step 2: Create Supabase client**

Create `frontend/src/services/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Expected: `supabaseClient.ts` created with proper error handling

---

- [ ] **Step 3: Create auth service**

Create `frontend/src/services/authService.ts`:

```typescript
import { supabase } from './supabaseClient';
import { User } from '../types';

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.session?.user;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user
      ? {
          id: data.user.id,
          email: data.user.email || '',
          created_at: new Date().toISOString(),
        }
      : null;
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          created_at: new Date().toISOString(),
        };
        callback(user);
      } else {
        callback(null);
      }
    });

    return data.subscription;
  },
};
```

Expected: `authService.ts` created with login, logout, getCurrentUser, and auth state listener

---

- [ ] **Step 4: Create useAuth hook**

Create `frontend/src/hooks/useAuth.ts`:

```typescript
import { useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const subscription = authService.onAuthStateChange((newUser) => {
      setUser(newUser);
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const loggedInUser = await authService.login(email, password);
      if (loggedInUser) {
        setUser({
          id: loggedInUser.id,
          email: loggedInUser.email || '',
          created_at: loggedInUser.created_at,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      throw err;
    }
  };

  return { user, isLoading, error, login, logout };
}
```

Expected: `useAuth.ts` hook created for managing auth state

---

- [ ] **Step 5: Commit auth services**

```bash
cd /home/ubuntu/Downloads/Podcast_claude
git add frontend/src/types/index.ts frontend/src/services/supabaseClient.ts frontend/src/services/authService.ts frontend/src/hooks/useAuth.ts
git commit -m "feat: implement Supabase auth service with hook

- Create Supabase client initialization
- Implement authService with login/logout/getCurrentUser
- Create useAuth hook for managing auth state
- Add TypeScript interfaces for all data models"
```

Expected: Commit created with auth services and types

---

### Task 4: Login Page Component

**Files:**
- Create: `frontend/src/components/LoginPage.tsx`

**Objective:** Create login form UI and integrate with auth service.

---

- [ ] **Step 1: Create LoginPage component**

Create `frontend/src/components/LoginPage.tsx`:

```typescript
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { login, error: authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email) {
      setLocalError('Email is required');
      return;
    }

    if (!password) {
      setLocalError('Password is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      // Navigation happens automatically via App.tsx after auth state change
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>🎵 Music Manager</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            style={inputStyles}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            style={inputStyles}
          />
        </div>

        {displayError && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            ✗ {displayError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            ...buttonStyles,
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

const inputStyles: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  marginTop: '0.25rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '1rem',
  boxSizing: 'border-box',
};

const buttonStyles: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  backgroundColor: '#1DB954',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
};
```

Expected: `LoginPage.tsx` created with email/password form

---

- [ ] **Step 2: Commit LoginPage**

```bash
git add frontend/src/components/LoginPage.tsx
git commit -m "feat: create LoginPage component

- Add email/password form with validation
- Integrate with auth service
- Display error messages
- Show loading state during submission"
```

Expected: Commit created with LoginPage component

---

### Task 5: App.tsx Root Component & Routing

**Files:**
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/App.css`
- Create: `frontend/src/main.tsx`
- Create: `frontend/public/index.html`

**Objective:** Create root component with authentication routing and basic layout.

---

- [ ] **Step 1: Create HTML template**

Create `frontend/public/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Music Manager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Expected: `index.html` created as entry point

---

- [ ] **Step 2: Create main.tsx entry point**

Create `frontend/src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Expected: `main.tsx` created as React entry point

---

- [ ] **Step 3: Create App component**

Create `frontend/src/App.tsx`:

```typescript
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/LoginPage';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <h1>🎵 Music Manager</h1>
        <p>User: {user.email}</p>
      </header>

      <main style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
        <h2>Welcome to Music Manager</h2>
        <p>This is a placeholder dashboard. More features coming soon!</p>
      </main>

      <footer style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderTop: '1px solid #ddd' }}>
        <p>Music Player (footer component placeholder)</p>
      </footer>
    </div>
  );
}

export default App;
```

Expected: `App.tsx` created with auth routing and basic layout

---

- [ ] **Step 4: Create CSS file**

Create `frontend/src/App.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: #ffffff;
  color: #333333;
}

h1, h2, h3 {
  color: #191414;
}

button {
  font-family: inherit;
}

input, textarea {
  font-family: inherit;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
```

Expected: `App.css` created with basic styles

---

- [ ] **Step 5: Verify build works**

```bash
cd /home/ubuntu/Downloads/Podcast_claude/frontend
npm run build
```

Expected: Build succeeds, `dist/` folder created with compiled app

---

- [ ] **Step 6: Commit App and entry point**

```bash
git add frontend/src/App.tsx frontend/src/App.css frontend/src/main.tsx frontend/public/index.html
git commit -m "feat: create App root component and entry point

- Add authentication-based routing (LoginPage or Dashboard)
- Create main.tsx React entry point
- Add HTML template
- Include basic styling"
```

Expected: Commit created with App component and entry point

---

### Task 6: GitHub Pages Deployment Setup

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `package.json` in root (add deploy script)

**Objective:** Set up GitHub Actions CI/CD to build and deploy to GitHub Pages.

---

- [ ] **Step 1: Create GitHub Actions workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./frontend
        run: npm install

      - name: Build React app
        working-directory: ./frontend
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build

      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
          cname: music-manager.example.com
```

Expected: `.github/workflows/deploy.yml` created

---

- [ ] **Step 2: Add GitHub secrets**

In GitHub repository settings > Secrets and variables > Actions:
1. Add `VITE_SUPABASE_URL` (from your Supabase project)
2. Add `VITE_SUPABASE_ANON_KEY` (from your Supabase project)

Expected: GitHub Actions secrets configured

---

- [ ] **Step 3: Create DEPLOY documentation**

Create `application_documents/04_setup_and_deployment/DEPLOY_001_github_pages.md`:

```markdown
# DEPLOY_001: GitHub Pages Deployment

## Prerequisites

1. GitHub repository created
2. GitHub Actions enabled
3. Supabase project created with credentials
4. Environment variables configured

## Deployment Process

### Step 1: Add GitHub Secrets

Settings > Secrets and variables > Actions

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### Step 2: Configure GitHub Pages

Settings > Pages:
- Source: Deploy from a branch
- Branch: `gh-pages`
- Folder: `/ (root)`

### Step 3: Push to main

GitHub Actions automatically triggers on push to main:

\`\`\`bash
git push origin main
\`\`\`

Workflow:
1. Installs dependencies
2. Builds React app (Vite)
3. Deploys dist/ to gh-pages branch
4. GitHub Pages serves the built app

### Step 4: Access Deployed App

App available at:
- `https://username.github.io/Podcast_claude/`
- Or at custom domain if configured

## Monitoring Deployments

GitHub > Actions tab shows:
- Build status
- Build logs
- Deployment history

## Troubleshooting

- **Build fails:** Check npm run build locally first
- **Secrets missing:** Verify VITE_SUPABASE_* secrets added
- **Page not found:** Check gh-pages branch exists and has content
```

Expected: DEPLOY_001 created

---

- [ ] **Step 4: Verify workflow file syntax**

```bash
cd /home/ubuntu/Downloads/Podcast_claude
# Validate YAML syntax (GitHub will do this too)
npm install -g yaml-validator
yaml-validator .github/workflows/deploy.yml
```

Expected: YAML file is valid

---

- [ ] **Step 5: Commit deployment setup**

```bash
git add .github/workflows/deploy.yml application_documents/04_setup_and_deployment/DEPLOY_001_github_pages.md
git commit -m "chore: set up GitHub Pages CI/CD deployment

- Add GitHub Actions workflow for build and deploy
- Document environment variable setup
- Configure gh-pages branch for hosting
- Enable automatic deployment on push to main"
```

Expected: Commit created with deployment configuration

---

## Phase 1 Completion Checklist

- [ ] React + TypeScript + Vite project initialized
- [ ] NPM dependencies installed
- [ ] Supabase project created with 6 tables
- [ ] All RLS policies applied
- [ ] Storage bucket created
- [ ] Supabase client service created
- [ ] Auth service with login/logout implemented
- [ ] useAuth hook created
- [ ] LoginPage component created
- [ ] App.tsx root component with routing
- [ ] GitHub Pages CI/CD workflow created
- [ ] All environment variables configured
- [ ] All commits pushed to main

**After completion, run verification:**

```bash
cd /home/ubuntu/Downloads/Podcast_claude/frontend
npm run dev
# App should start at http://localhost:5173
# Verify login form appears
```

---

## Next Phase (Phase 2: Foundation → Core Features)

After Phase 1 is complete and verified:

1. Create Dashboard layout (master-detail with sidebar)
2. Implement Sidebar navigation component
3. Create Playlists view & list component
4. Create Songs view & list component
5. Create basic music player component
6. Implement playlist CRUD operations

See `application_documents/02_planning/PLAN_001_music_app_overview.md` for full phase breakdown.

---

## Architecture Decisions Made in Phase 1

| Decision | Rationale |
|----------|-----------|
| **Vite over CRA** | Faster dev server, faster builds, less config |
| **Component-level state only** | Simpler than Redux for this scope |
| **Supabase RLS policies** | Database enforces security, no app-level role checking needed |
| **GitHub Pages** | Free, integrated with GitHub, simple CI/CD |
| **Environment variables** | Supabase credentials not in code |
| **Functional components only** | Hooks-based React (modern, cleaner) |

---

**Version:** 1.0
**Status:** Ready for Implementation
**Last Updated:** 2026-03-24
