# PLAN_001: Music Management Web Application - Project Overview

**Document Type:** Planning
**Status:** Active
**Created:** 2026-03-24
**Last Updated:** 2026-03-24

---

## 1. Project Vision & Purpose

Create a simple, lightweight web-based music management and playback application that allows users to:
- Manage a personal music library (local audio files + streaming URLs)
- Organize music into playlists
- Resume playback from the exact position they last listened
- Share playlists with other users
- Access their library from any device

**Why?** There's a gap in the market for a minimal, privacy-focused music player that doesn't require complex backend infrastructure. This application demonstrates a clean architecture using modern serverless infrastructure (Supabase).

---

## 2. Project Scope

### In Scope
✅ User authentication with Supabase
✅ Playlist creation, editing, deletion, reordering
✅ Song library management (add via file upload or URL)
✅ Music player with core controls (play, pause, volume, progress)
✅ Playback position tracking and resume
✅ Playlist sharing with other users
✅ Repeat modes (all, one, none) and shuffle
✅ Multi-user support with private/shared data separation
✅ Drag-and-drop reordering
✅ Auto-skip on unavailable song (error resilience)

### Out of Scope
❌ Recommendations or suggestions
❌ Favoriting or rating songs
❌ Statistics or listening history
❌ Social features (following, comments, etc.)
❌ Offline mode or caching
❌ User registration/signup (admin-created accounts only)
❌ Podcast-specific features
❌ Video support

---

## 3. Target Users

**Primary User:** Individual music enthusiasts who want a lightweight player for their personal music library

**Secondary User:** Groups of users who want to share curated playlists

**Scenario:** A user has 100 local MP3 files and 20 favorite streaming URLs. They want to organize these into 5 themed playlists (Workout, Relaxation, Focus, Party, etc.) and resume from where they left off when they come back.

---

## 4. Technical Approach

### Architecture Pattern
Serverless + Static Hosting

- **Frontend:** React SPA (Single Page Application) hosted on GitHub Pages
- **Backend:** Supabase (managed PostgreSQL + Auth + Object Storage)
- **Deployment:** GitHub Actions → GitHub Pages

### Why This Approach?
- **Low Cost:** Free tier for Supabase handles most personal use; GitHub Pages is free
- **Low Ops:** No backend to manage, no servers to maintain
- **Fast Development:** Supabase auth and database out-of-the-box
- **Scalable:** Can easily handle thousands of users with minimal infrastructure changes

---

## 5. Tech Stack Summary

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend Framework** | React 18+ | Component-based, large ecosystem, fast development |
| **Language** | TypeScript | Type safety, better IDE support, fewer runtime errors |
| **Build Tool** | Vite | Fast dev server, fast builds, minimal configuration |
| **Backend Database** | Supabase (PostgreSQL) | SQL relational model, RLS for security, managed service |
| **Auth** | Supabase Auth | JWT-based, integrates with frontend, no custom auth code |
| **File Storage** | Supabase Storage | S3-compatible, simple API, integrated with Supabase |
| **State Management** | Component-level state | Minimal complexity, fetch from Supabase as needed |
| **Styling** | CSS3 + TailwindCSS (optional) | Fast styling, responsive design |
| **Deployment** | GitHub Pages | Free, automatic, integrates with GitHub |

---

## 6. Core Features Overview

### Feature 1: User Authentication
- Supabase handles login/logout
- User accounts created in Supabase portal (not self-signup)
- JWT tokens stored in browser
- Session auto-expires on logout or token expiration

### Feature 2: Playlist Management
- Create unlimited playlists
- Rename, edit description, delete playlists
- Reorder playlists (optional)
- Reorder songs within playlists via drag-and-drop
- View song count per playlist

### Feature 3: Song Library
- Add local audio files via file upload (stored in Supabase Storage)
- Add songs via HTTPS URLs (streamable content)
- Edit song metadata (title, artist, duration)
- Delete songs from library
- View all songs across all playlists

### Feature 4: Music Playback
- Play/pause button
- Progress bar with seek capability
- Volume control
- Next/previous song navigation (within playlist)
- Current time / total duration display
- Repeat modes: no repeat, repeat all, repeat one
- Shuffle toggle

### Feature 5: Playback Position Resume
- Automatically save current playback position every 5-10 seconds
- Resume from exact position when reopening browser/tab
- Track position per song per playlist per user
- Survives browser restarts and device changes

### Feature 6: Playlist Sharing
- Share playlists with other users by email
- Recipients see shared playlists in "Shared with Me" section
- Shared playlists are read-only for recipients
- Each user tracks playback independently on shared playlists
- Recipients can unshare playlists (leave access)

---

## 7. Success Criteria

The project is complete when:

✅ Users can create accounts (via Supabase portal) and log in
✅ Users can create multiple playlists and manage them (add, rename, delete)
✅ Users can upload local audio files to their library
✅ Users can add streaming URLs to their library
✅ Users can play songs with full player controls
✅ Playback position auto-saves and resumes correctly
✅ Users can reorder songs within playlists (drag-and-drop)
✅ Users can share playlists and others can listen to shared playlists
✅ Repeat modes and shuffle work as expected
✅ Unavailable songs are auto-skipped
✅ Frontend is deployed and accessible on GitHub Pages
✅ No backend infrastructure needed (pure Supabase)

---

## 8. Project Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up React + TypeScript + Vite project
- [ ] Initialize Supabase project
- [ ] Create PostgreSQL database schema (6 tables)
- [ ] Implement user authentication (login/logout)
- [ ] Deploy skeleton app to GitHub Pages

### Phase 2: Core Features (Week 2)
- [ ] Implement playlist CRUD (create, read, update, delete)
- [ ] Implement song library management
- [ ] Build music player UI with play/pause/volume/progress
- [ ] Implement file upload to Supabase Storage

### Phase 3: Persistence & Resume (Week 3)
- [ ] Implement playback position auto-save (every 5-10 seconds)
- [ ] Load and restore playback position on song play
- [ ] Test across browser sessions and device restarts

### Phase 4: Player Enhancements (Week 4)
- [ ] Add repeat modes
- [ ] Add shuffle toggle
- [ ] Add next/previous navigation
- [ ] Implement error handling (auto-skip)

### Phase 5: Advanced Features (Week 5)
- [ ] Implement playlist sharing
- [ ] Add drag-and-drop reordering
- [ ] Add URL support for streaming songs
- [ ] Set up RLS policies for sharing security

### Phase 6: Polish & Testing (Week 6)
- [ ] UI refinement and consistency
- [ ] Comprehensive testing (unit, integration, e2e)
- [ ] Performance optimization
- [ ] Documentation completion

---

## 9. Key Assumptions & Dependencies

### Assumptions
1. **User Accounts:** Users are created by admin in Supabase portal, not via signup form
2. **Internet Required:** Application requires internet connection to play songs and sync data
3. **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge) with HTML5 Audio support
4. **File Size Limits:** Supabase Storage respects standard file size limits
5. **HTTPS URLs:** Streaming URLs must be HTTPS only (no HTTP due to browser security policies)

### Dependencies
- **Supabase Account:** Project requires an active Supabase project
- **GitHub Account:** Required for GitHub Pages deployment
- **DNS/Domain:** GitHub Pages provides free `username.github.io` domain
- **Node.js:** Required for local development

---

## 10. Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Supabase Storage API changes | Medium | Low | Monitor Supabase changelog, maintain vendor lock-in awareness |
| CORS issues with external URLs | Medium | Medium | Use CORS-friendly URLs only, test early |
| Database performance with large playlists | Low | Low | Implement pagination if needed, monitor query performance |
| Browser storage quota limits | Low | Low | Implement cleanup logic for old playback positions |
| User lockout due to lost credentials | High | Medium | Implement account recovery via Supabase Auth features |

---

## 11. Non-Functional Requirements

### Performance
- Page load time: < 3 seconds
- Playlist load: < 1 second
- Song metadata update: < 500ms
- Playback resume: Instantaneous (or < 500ms)

### Security
- All data encrypted in Supabase (TLS in transit, at rest)
- Row-Level Security (RLS) enforces user data isolation
- No sensitive data in browser localStorage beyond JWT token
- File uploads validated for audio types

### Scalability
- Support 1000+ concurrent users (Supabase free tier can handle this)
- Support users with 10,000+ songs
- Support playlists with 1000+ songs
- Auto-save mechanism doesn't cause database bottlenecks

### Reliability
- Graceful error handling (no red screens of death)
- Auto-skip on unavailable songs
- Retry logic for transient network failures
- Session recovery on network reconnect

---

## 12. Documentation & Knowledge Management

All documentation follows strict governance rules defined in `DOCUMENT_RULES.md`:

- **Planning docs** → `02_planning/`
- **Design docs** → `03_design/`
- **Setup & deployment** → `04_setup_and_deployment/`
- **Feature docs** → `06_features/`
- **Operations docs** → `05_operations/` (post-launch)
- **Prompt logs** → `07_prompt_logs/` (design decision history)

See `DOCUMENT_MAP.md` for complete documentation structure.

---

## 13. Approval & Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Project Owner | User | 2026-03-24 | ✅ Approved |
| Technical Lead | (TBD) | | Pending |

---

## Next Steps

1. ✅ Design phase complete (see `03_design/` documents)
2. → Start Phase 1 (Foundation) implementation
3. → Create implementation plan in `executing-plans` skill
4. → Begin development following implementation plan
5. → Check progress against success criteria regularly

---

**Document Status:** Ready for Implementation
**Last Review:** 2026-03-24
**Next Review:** After Phase 1 completion
