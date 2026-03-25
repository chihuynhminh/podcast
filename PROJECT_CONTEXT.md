# PROJECT_CONTEXT.md - Music Manager Project Guide for AI Agents

**Status:** Phase 1 Complete ✅ | Live at https://chihuynhminh.github.io/podcast/

---

## Quick Project Summary

**What is it?**
Music Manager is a web application for managing personal music libraries with:
- Support for local audio files (uploaded to Supabase Storage)
- Support for streaming URLs (HTTPS audio links)
- Playlist organization and management
- Music playback with play/pause/skip/volume controls
- Playback position resume (remembers where you stopped)
- Playlist sharing with other users (read-only access)

**Why this design?**
- Multi-user with Supabase (serverless backend)
- GitHub Pages (free static hosting)
- React + TypeScript (modern, type-safe frontend)
- No custom backend server needed (RLS policies handle security)

**Current Status:** Phase 1 complete and deployed. Ready for Phase 2.

---

## Project Structure

```
/home/ubuntu/Downloads/Podcast_claude/
├── application_documents/        # All project documentation
│   ├── 01_master_index/          # Navigation hub (START HERE)
│   ├── 02_planning/              # Project vision and roadmap
│   ├── 03_design/                # Architecture, database, UI design
│   ├── 04_setup_and_deployment/  # Setup guides and implementation plans
│   ├── 06_features/              # Feature specifications
│   └── 07_prompt_logs/           # AI session history
│
├── frontend/                      # React application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── LoginPage.tsx      # Authentication page
│   │   │   └── [Phase 2+] Dashboard, Player, etc.
│   │   ├── services/             # Supabase services
│   │   │   ├── supabaseClient.ts  # Supabase client init
│   │   │   └── authService.ts     # Login/logout logic
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── useAuth.ts         # Auth state management
│   │   ├── types/                # TypeScript interfaces
│   │   │   └── index.ts           # All data models
│   │   ├── App.tsx               # Root component (routing)
│   │   └── main.tsx              # Entry point
│   ├── index.html                # HTML template
│   ├── vite.config.ts            # Vite build config
│   ├── tsconfig.json             # TypeScript config
│   └── package.json              # Dependencies
│
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions CI/CD
│
├── .supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Database schema (6 tables + RLS)
│
└── .gitignore
```

---

## Key Technologies

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + TypeScript | Modern, type-safe, component-based |
| Build Tool | Vite | Fast dev/build, optimized output |
| Backend/DB | Supabase PostgreSQL | Managed database, auth, storage |
| Auth | Supabase Auth | Built-in, no custom auth needed |
| File Storage | Supabase Storage | S3-compatible, simple API |
| Hosting | GitHub Pages | Free, integrated with repo |
| Deploy | GitHub Actions | CI/CD automation |

---

## Database Schema (6 Tables)

**All tables have RLS policies for multi-user security.**

1. **users** - Linked to Supabase Auth
2. **songs** - User's song library (local files + URLs)
3. **playlists** - User's playlists
4. **playlist_songs** - Junction table (songs in playlists with ordering)
5. **playback_positions** - Resume data (per user, song, playlist)
6. **playlist_shares** - Playlist sharing access control

See: `03_design/DSGN_002_database_schema.md` for complete details

---

## Current Implementation Status

### ✅ Phase 1: Foundation (COMPLETE)

**Implemented:**
- React + TypeScript + Vite project initialized
- Supabase project with 6-table schema + RLS policies
- Authentication service (login/logout)
- LoginPage component with form validation
- App root component with auth-based routing
- GitHub Pages deployment with automated CI/CD
- All environment variables configured

**Files:**
- `frontend/src/` - All components, services, hooks, types
- `.supabase/migration/001_initial_schema.sql` - Database
- `.github/workflows/deploy.yml` - CI/CD automation
- `application_documents/04_setup_and_deployment/` - Setup guides

**Testing:**
- ✅ Build succeeds: `npm run build`
- ✅ Dev server works: `npm run dev`
- ✅ Login form appears and works
- ✅ GitHub Actions deploys to GitHub Pages
- ✅ App live at: https://chihuynhminh.github.io/podcast/

---

### 🔄 Phase 2: Core Features (READY TO START)

**To Implement:**
1. Dashboard layout (sidebar + main content + footer)
2. Playlist management (CRUD: create, read, update, delete)
3. Song library view
4. Basic music player with controls
5. Integration with Supabase for data persistence

**Key Files to Create:**
- `Dashboard.tsx` - Main app layout
- `Sidebar.tsx` - Navigation menu
- `PlaylistsView.tsx` - List and manage playlists
- `SongsView.tsx` - View song library
- `MusicPlayer.tsx` - Playback controls
- `playlistService.ts` - Playlist CRUD operations
- `songService.ts` - Song operations

**Reference Documents:**
- `03_design/DSGN_003_ui_design.md` - UI/UX specifications
- `06_features/FEAT_001_playlist_management.md` - Playlist logic
- `06_features/FEAT_002_music_playback.md` - Player logic

---

## Skills Required for AI Agents Working on This Project

### For Design/Planning Work
- **skill: brainstorming** - When exploring new features or design options
- **skill: writing-plans** - When creating implementation plans for phases
- **skill: asking-user-questions** - When requirements are ambiguous

### For Implementation Work
- **skill: test-driven-development** - When implementing features
- **skill: subagent-driven-development** - For multi-task phases (Phase 2+)
- **skill: systematic-debugging** - When fixing bugs or test failures
- **skill: requesting-code-review** - Before merging major features

### For Review/Completion
- **skill: verification-before-completion** - Before claiming work is done
- **skill: finishing-a-development-branch** - When completing feature branches
- **skill: receiving-code-review** - When handling user feedback

### For General Work
- **skill: using-superpowers** - At start of each session to orient on available skills
- **skill: asking-user-questions** - Whenever blocked or needing clarification (DON'T STOP - use this!)

---

## Documentation Governance Rules

**ALL documentation must:**
1. Be stored in `application_documents/` folder
2. Use correct folder structure (01_master_index, 02_planning, etc.)
3. Follow file naming: `TYPE_###_short_description.md`
4. Use TYPE prefixes: PLAN, DSGN, FEAT, SETUP, DEPLOY, etc.
5. Have git versioning (no version numbers in filenames)
6. Be reflected in DOCUMENT_MAP.md when new
7. Include prompt log entry in `07_prompt_logs/` after completion

See: `01_master_index/DOCUMENT_RULES.md` for complete rules

---

## How to Get Started in Future Sessions

### New Agent Checklist:

1. **Read Project Context**
   - This file (PROJECT_CONTEXT.md)
   - Time: 5 minutes

2. **Understand Current Status**
   - Check `DOCUMENT_MAP.md` for phase status
   - Read latest prompt log in `07_prompt_logs/`
   - Time: 5 minutes

3. **Review Phase-Specific Docs**
   - If continuing Phase 1: `IMPL_001_phase_1_foundation.md`
   - If starting Phase 2: `IMPL_ROADMAP_all_phases.md` + `03_design/` docs
   - Time: 10-15 minutes

4. **Set Up Local Environment**
   - `cd frontend && npm install`
   - Create `.env.local` with Supabase credentials
   - Time: 2 minutes

5. **Test Current State**
   - `npm run dev` - verify dev server works
   - `npm run build` - verify build succeeds
   - Time: 2 minutes

6. **Check with User**
   - Use `using-superpowers` skill to see available skills
   - Ask what work needs to be done
   - Time: 1 minute

**Total onboarding: ~30 minutes**

---

## Key Environment Variables

Required for development and CI/CD:

```bash
# In frontend/.env.local (for local dev)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# In GitHub Settings > Secrets
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Do NOT commit .env.local to git** (already in .gitignore)

---

## Common Commands

```bash
# Development
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build

# Git operations
git status           # Check status
git add <files>      # Stage changes
git commit -m "..."  # Commit with message
git push origin master # Push to GitHub (auto-triggers CI/CD)

# Useful for debugging
npm run type-check   # Check TypeScript errors
npm run build 2>&1   # Build with error output
```

---

## Troubleshooting for Future Sessions

### "Module not found" errors
- Solution: `cd frontend && npm install`
- This usually happens when checking out fresh code

### "Missing environment variables"
- Solution: Create `frontend/.env.local` with credentials
- See PROJECT_CONTEXT.md Environment Variables section

### Build fails with TypeScript errors
- Solution: Check `frontend/src/` files for type issues
- Run `npm run type-check` to see all errors
- Useful skill: `skill: systematic-debugging`

### Deployment failed in GitHub Actions
- Check: `.github/workflows/deploy.yml` configuration
- Check: GitHub secrets are set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- Check: GitHub Pages configured to use `gh-pages` branch

---

## Git Strategy

**Branch:** `master` (main development branch)
**Deployment:** Auto-triggers on push to master
**Commits:** Atomic, descriptive commit messages

**Example commit message:**
```
feat: implement Dashboard component with sidebar

- Add Dashboard.tsx with master-detail layout
- Create Sidebar.tsx with navigation
- Add responsive CSS styling
- Integrate with playlistService for data fetching
```

---

## Testing Strategy

See `IMPL_ROADMAP_all_phases.md` for detailed testing plan.

**Per-Phase Testing:**
- Phase 1: Build succeeds, DevServer works, Login form appears ✅
- Phase 2: Dashboard loads, can create/edit/delete playlists
- Phase 3: Playback position persists across sessions
- Phase 4: Repeat/shuffle/volume controls work
- Phase 5: File upload and sharing work
- Phase 6: Full test suite passes

---

## Contact / Next Steps

**Current User:** chihuynhminh

**For Next Session:**
1. Check GitHub: https://github.com/chihuynhminh/podcast
2. Read DOCUMENT_MAP.md
3. Review latest prompt log in `07_prompt_logs/`
4. Follow "How to Get Started" checklist above

**Recommended Next Work:** Implement Phase 2 (Dashboard + Playlists)

---

**Created:** 2026-03-25
**Last Updated:** 2026-03-25
**Status:** Ready for Phase 2
