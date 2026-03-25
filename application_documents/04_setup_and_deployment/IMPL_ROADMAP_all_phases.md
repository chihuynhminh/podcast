# IMPL_ROADMAP: Complete Implementation Roadmap (All Phases)

> Implementation roadmap covering all 6 development phases with task breakdown, dependencies, and verification points.

**Goal:** Execute complete Music Manager application from foundation through production.

**Scope:** Phase 1 (Foundation) through Phase 6 (Polish & Testing)

**Timeline:** Estimated 40-60 hours total development

---

## Phase Overview & Execution Order

### Phase 1: Foundation ✅ (Detailed Plan Available)

**Duration:** 8-10 hours | **File:** `IMPL_001_phase_1_foundation.md`

**Deliverables:**
- React + TypeScript + Vite project initialized
- Supabase project with 6-table schema + RLS policies
- User authentication (login/logout)
- GitHub Actions CI/CD to GitHub Pages
- Basic skeleton app

**Verification:**
- `npm run dev` starts app
- Login form appears and works
- GitHub Actions deployment workflow runs
- App accessible at `https://username.github.io/Podcast_claude/`

**Next:** Complete Phase 1 before starting Phase 2

---

### Phase 2: Core Features (6-8 hours)

**Dependencies:** Phase 1 complete

**Key Tasks:**
1. **Dashboard Layout** - Master-detail layout with sidebar
   - Sidebar component with "Playlists" and "Songs" navigation
   - MainContent area (dynamic)
   - Top bar with user info & logout
   - Test: Navigation between Playlists and Songs views

2. **Playlist Management** - CRUD operations
   - PlaylistsView component (list all playlists)
   - AddPlaylistModal component
   - EditPlaylistModal component
   - playlistService.ts with getPlaylists, createPlaylist, updatePlaylist, deletePlaylist
   - Test: Create, edit, delete playlists

3. **Song Library Management**
   - SongsView component (list all songs)
   - songService.ts with getSongs, createSong, updateSong, deleteSong
   - Test: Display songs without file upload yet

4. **Basic Music Player**
   - MusicPlayer component at bottom
   - Play/pause button
   - Current song display
   - Progress bar (basic)
   - Time display
   - playerService.ts with play, pause, seek functions
   - Test: Select and play a song

**Deliverables:**
- Dashboard with sidebar navigation working
- Can create and manage playlists
- Can view song library
- Basic player functional

---

### Phase 3: Persistence & Resume (4-6 hours)

**Dependencies:** Phase 2 complete

**Key Tasks:**
1. **Playback Position Auto-Save**
   - Add onTimeUpdate listener to audio element
   - Auto-save every 5-10 seconds (debounced)
   - Save on pause/stop
   - playerService.ts: savePlaybackPosition() with upsert
   - Test: Position saved while playing, verified in DB

2. **Load & Resume Position**
   - On song play: load saved position
   - Set audio.currentTime to saved position
   - Restore across browser restarts
   - Test: Play song, pause, refresh browser, replay = resumes correctly

3. **Playback Listener Integration**
   - usePlayerPosition hook for fetching saved position
   - usePlayerAutoSave hook for auto-saving
   - Test: Multiple songs track positions independently

**Deliverables:**
- Playback position tracking working
- Position persists across sessions
- Multi-song position tracking verified

---

### Phase 4: Player Enhancements (4-5 hours)

**Dependencies:** Phase 3 complete

**Key Tasks:**
1. **Repeat Modes**
   - Add repeat button (cycles: none → all → one)
   - State management: repeatMode
   - onAudioEnded listener with repeat logic
   - Persist repeatMode to localStorage
   - Test: All three modes work correctly

2. **Shuffle**
   - Add shuffle toggle button
   - Generate shuffled order on enable
   - Swap between shuffled and original on toggle
   - Test: Shuffle randomizes, disable returns to normal

3. **Previous/Next Navigation**
   - Connect nav buttons to playlist indices
   - Handle wrap-around behavior
   - Restore playback position on revisit
   - Test: Navigation works in all combinations

4. **Volume Control**
   - Volume slider (0-100%)
   - Persist to localStorage
   - Update audio.volume
   - Test: Volume changes persist

**Deliverables:**
- Repeat modes working
- Shuffle functioning
- Next/previous navigation working
- Volume control working

---

### Phase 5: Advanced Features (8-10 hours)

**Dependencies:** Phase 4 complete

**Key Tasks:**
1. **File Upload**
   - AddSongModal with file picker
   - Validate file type (audio only)
   - Calculate duration client-side
   - Upload to Supabase Storage: users/{user_id}/songs/{filename}
   - Create songs record with file_path and signed URL
   - Test: Upload .mp3 file, appears in library, plays correctly

2. **URL Support**
   - AddSongModal URL input form
   - Validate HTTPS format
   - Create songs record with url field
   - Test: Add streaming URL, plays

3. **Drag-and-Drop Reordering**
   - react-beautiful-dnd integration
   - SongList component with drag-drop
   - Update position on drop
   - Save to DB immediately
   - Test: Reorder songs, refresh = order persists

4. **Playlist Sharing**
   - SharePlaylistModal component
   - shareService.ts: sharePlaylist, getSharedPlaylists, unsharePlaylist
   - Show "Shared with Me" section
   - RLS policies enforce read-only for recipients
   - Test: Share with user, recipient sees in their list, can't edit

**Deliverables:**
- File upload working
- URL support working
- Drag-and-drop reordering working
- Playlist sharing working

---

### Phase 6: Polish & Testing (6-8 hours)

**Dependencies:** Phase 5 complete

**Key Tasks:**
1. **Error Handling**
   - Auto-skip on unavailable URL
   - Network error notifications
   - Form validation feedback
   - Test: Unavailable song auto-skips to next

2. **UI Refinement**
   - Consistent styling (colors, fonts, spacing)
   - Responsive layout (mobile/tablet)
   - Loading states and spinners
   - Empty states (no playlists, no songs)
   - Test: Visual consistency across all views

3. **Comprehensive Testing**
   - Unit tests for services
   - Integration tests for components
   - E2E tests for workflows
   - Test: All critical paths covered

4. **Performance Optimization**
   - Code splitting
   - Lazy loading components
   - Optimize re-renders
   - Test: App loads in < 3 seconds

5. **Documentation**
   - Update README
   - Create user guide
   - Document API in code
   - Test: All code is documented

**Deliverables:**
- Error handling comprehensive
- UI polished and consistent
- Tests passing (unit, integration, E2E)
- Performance optimized
- Documentation complete

---

## Critical Path & Dependencies

```
Phase 1 (Foundation)
    ↓
Phase 2 (Core Features)
    ↓
Phase 3 (Persistence) ← Can run parallel with 2 after basic player exists
    ↓
Phase 4 (Enhancements) ← Depends on Phase 3
    ↓
Phase 5 (Advanced) ← Depends on Phase 4
    ↓
Phase 6 (Polish & Testing)
```

**Critical Dependencies:**
- Auth must work before any other feature
- Database schema must be set up before services
- Basic player must exist before persistence
- File upload needs storage setup before Phase 5

---

## Testing Strategy

### Unit Tests (Per Component)
- Write test-first for every service function
- Test: login, createPlaylist, playSong, etc.
- Mock Supabase for services tests
- Coverage target: 80%+

### Integration Tests
- Test: Login → Create playlist → Add song → Play
- Test: Share playlist → Recipient sees it
- Test: Position saves → Resume works
- Use real Supabase test project

### E2E Tests (Optional, Nice to Have)
- Full user workflows with Cypress or Playwright
- Test: Create playlist, add song, play, share
- Test in actual browser environment

### Manual Testing Checklist
- See each feature document for detailed checklist
- All user workflows verified
- Cross-browser testing (Chrome, Firefox, Safari)

---

## Git Commit Strategy

**Frequent, small commits:**

```bash
# Per task (2-5 minute chunks)
git commit -m "feat: implement X feature"
git commit -m "test: add tests for X"
git commit -m "refactor: simplify X component"
git commit -m "docs: add documentation for X"
git commit -m "fix: handle X error case"
```

**Branch strategy:**
- `main` = production-ready (deployed to GitHub Pages)
- Feature branches optional (if team collaboration)
- Tag releases: `v1.0.0`, `v1.1.0`, etc.

---

## Verification Checklist (Per Phase)

### Phase 1 Verification
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts app
- [ ] Login form appears
- [ ] GitHub Actions workflow passes
- [ ] App deploys to GitHub Pages

### Phase 2 Verification
- [ ] Dashboard loads after login
- [ ] Can navigate between Playlists and Songs
- [ ] Can create and delete playlists
- [ ] Player component visible at bottom
- [ ] No console errors

### Phase 3 Verification
- [ ] Play a song
- [ ] Wait 10 seconds, position shows correct time
- [ ] Reload browser
- [ ] Replay same song = resumes from correct position
- [ ] Different songs track different positions

### Phase 4 Verification
- [ ] Repeat button cycles through modes
- [ ] Shuffle randomizes order
- [ ] Next/Previous buttons work
- [ ] Volume slider works
- [ ] All settings persist on reload

### Phase 5 Verification
- [ ] Upload .mp3 file, appears in library
- [ ] Add HTTPS URL, plays correctly
- [ ] Drag-reorder songs, order persists
- [ ] Share playlist, recipient sees it
- [ ] Recipient cannot edit shared playlist

### Phase 6 Verification
- [ ] All tests passing
- [ ] Build succeeds with no warnings
- [ ] App responsive on mobile, tablet, desktop
- [ ] No console errors or warnings
- [ ] All user workflows documented

---

## Effort Estimation

| Phase | Tasks | Hours | Status |
|-------|-------|-------|--------|
| 1: Foundation | 6 | 8-10 | Plan ready |
| 2: Core | 4 | 6-8 | Planned (tasks TBD) |
| 3: Persistence | 3 | 4-6 | Planned (tasks TBD) |
| 4: Enhancements | 4 | 4-5 | Planned (tasks TBD) |
| 5: Advanced | 4 | 8-10 | Planned (tasks TBD) |
| 6: Polish | 5 | 6-8 | Planned (tasks TBD) |
| **TOTAL** | **26** | **40-60** | **Kickoff Ready** |

---

## Next Steps

**To Execute Phase 1:**

Option A: **Subagent-Driven** (recommended)
- Fresh subagent per task
- Review between tasks
- Best for quality checks

Option B: **Inline Execution**
- Execute in current session
- Batch execution with checkpoints
- Faster but less review

**To Start:**

```bash
cd /home/ubuntu/Downloads/Podcast_claude
# Review plan
cat application_documents/04_setup_and_deployment/IMPL_001_phase_1_foundation.md

# Execute Phase 1
# (See execution options below)
```

---

## Implementation Documentation Index

**Detailed Plans:**
- `IMPL_001_phase_1_foundation.md` - Phase 1 (6 detailed tasks)
- `IMPL_ROADMAP.md` - This file (all phases overview)

**Design References:**
- `PLAN_001_music_app_overview.md` - Project goals and phases overview
- `DSGN_001_system_architecture.md` - Architecture decisions
- `DSGN_002_database_schema.md` - Database structure
- `DSGN_003_ui_design.md` - UI/UX specifications
- `FEAT_001-004.md` - Feature details

**Setup & Deployment:**
- `SETUP_001_environment_config.md` - Local development setup
- `DEPLOY_001_github_pages.md` - GitHub Pages deployment

---

**Version:** 1.0
**Status:** Ready for Execution
**Last Updated:** 2026-03-24

---

## Questions Before Starting?

If you have questions about:
- **Phase 1 tasks** - See IMPL_001_phase_1_foundation.md (detailed)
- **Design decisions** - See DSGN_* documents
- **Features** - See FEAT_* documents
- **Deployment** - See DEPLOY_001.md

Otherwise, ready to proceed with Phase 1!
