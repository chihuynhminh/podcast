=== MUSIC MANAGEMENT WEB APPLICATION - DOCUMENT MAP ===

## Overview

This is the central navigation hub for the Music Management Web Application project documentation. All documentation is organized by function and stored in the `application_documents/` folder following strict governance rules defined in DOCUMENT_RULES.md.

---

## Recommended Reading Order

**For New Team Members:**
1. This file (DOCUMENT_MAP.md) - You are here
2. `02_planning/PLAN_001_music_app_overview.md` - Understand the project scope and why we're building it
3. `03_design/DSGN_001_system_architecture.md` - High-level system design
4. `03_design/DSGN_002_database_schema.md` - Data model and relationships
5. `03_design/DSGN_003_ui_design.md` - User interface layout and flows
6. `06_features/FEAT_001_playlist_management.md` - Feature details

**For Implementation:**
1. `04_setup_and_deployment/SETUP_001_environment_config.md` - Local dev setup
2. `04_setup_and_deployment/DEPLOY_001_github_pages.md` - Deployment process
3. Individual feature docs in `06_features/` for the feature being implemented
4. `07_prompt_logs/` - Historical context of design decisions

---

## Documentation Structure

### 01_master_index/
**Purpose:** Central navigation and documentation control hub

| File | Purpose |
|------|---------|
| DOCUMENT_RULES.md | Governance rules for all documentation (non-negotiable) |
| DOCUMENT_MAP.md | This file - central navigation hub |

---

### 02_planning/
**Purpose:** Project requirements, roadmaps, and task breakdowns
**Answers:** "What are we building, why, and when will it be done?"

| File | Purpose |
|------|---------|
| PLAN_001_music_app_overview.md | Project vision, scope, and high-level approach |

---

### 03_design/
**Purpose:** System design, architecture, UI/UX, and technical decisions
**Answers:** "How is the system structurally and visually designed, and why?"

| File | Purpose |
|------|---------|
| DSGN_001_system_architecture.md | High-level architecture, tech stack, component overview |
| DSGN_002_database_schema.md | Complete database schema with tables, columns, constraints, RLS policies |
| DSGN_003_ui_design.md | UI layout, page flows, component hierarchy, interaction patterns |
| DSGN_004_api_specifications.md | Supabase API endpoints, request/response formats, error handling |

---

### 04_setup_and_deployment/
**Purpose:** Environment setup, installation, and deployment procedures
**Answers:** "How do I install the system and deploy it?"

| File | Purpose |
|------|---------|
| SETUP_001_environment_config.md | Local development environment setup (Supabase, database, credentials) |
| DEPLOY_001_github_pages.md | GitHub Pages deployment process and GitHub Actions CI/CD workflow |
| IMPL_001_phase_1_foundation.md | **Phase 1 detailed implementation plan** - Complete with 6 tasks |
| IMPL_ROADMAP_all_phases.md | **Full roadmap for all 6 development phases** (Foundation → Polish) |

---

### 05_operations/
**Purpose:** Post-deployment system management and maintenance
**Answers:** "How do we operate and maintain the system?"

Currently empty - will be populated as system matures.

---

### 06_features/
**Purpose:** Feature-level functional documentation
**Answers:** "What does this feature do and how does it behave?"

| File | Purpose |
|------|---------|
| FEAT_001_playlist_management.md | Create, edit, delete, and manage playlists |
| FEAT_002_music_playback.md | Audio playback, controls, repeat, shuffle features |
| FEAT_003_file_upload.md | Local file upload to Supabase Storage and metadata handling |
| FEAT_004_playlist_sharing.md | Share playlists with other users and access control |

---

### 07_prompt_logs/
**Purpose:** AI interaction tracking and traceability
**Ensures:** Full audit trail of design decisions and changes
**Note:** Check these logs to understand project evolution and why decisions were made

| File | Purpose |
|------|---------|
| 2026-03-24_prompt_001_design_documents.md | Design phase: Created 11 design documents (architecture, database, UI, features) |
| 2026-03-25_prompt_001_phase_1_implementation.md | **Phase 1 implementation complete**: Auth, LoginPage, Supabase setup, GitHub Pages CI/CD |

---

### 08_other/
**Purpose:** Miscellaneous documentation
**Currently:** Empty - experimental or temporary docs go here

---

## Quick Reference: Key Technical Decisions

| Decision | Value | Document |
|----------|-------|----------|
| **Frontend Framework** | React 18+ with TypeScript | DSGN_001 |
| **State Management** | Component-level state + Supabase SDK | DSGN_001 |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) | DSGN_001 |
| **Deployment** | GitHub Pages via GitHub Actions | DEPLOY_001 |
| **Auth Method** | Supabase Auth (user portal setup, no self-signup) | DSGN_002 |
| **Playback Resume** | Auto-save every 5-10 seconds | FEAT_002 |
| **Player Controls** | Play/pause, next/prev, repeat, shuffle, volume | FEAT_002 |
| **File Storage** | Supabase Storage (users/{user_id}/songs/) | FEAT_003 |
| **Sharing Model** | Private by default, optional sharing, read-only for recipients | FEAT_004 |

---

## Data Model Overview

**Core Tables:**
- `users` - Supabase Auth managed user records
- `songs` - User's song library (local files + URLs)
- `playlists` - User's playlists
- `playlist_songs` - Songs in each playlist (with ordering)
- `playback_positions` - Resume data (per user, song, playlist)
- `playlist_shares` - Playlist sharing access control

See `DSGN_002_database_schema.md` for complete schema details.

---

## Feature Checklist

- ✅ User authentication
- ✅ Playlist CRUD
- ✅ Song library management
- ✅ Music player with basic controls
- ✅ File upload (local files to Supabase Storage)
- ✅ URL support (streaming from HTTPS URLs)
- ✅ Playback position resume
- ✅ Repeat modes and shuffle
- ✅ Playlist sharing
- ✅ Drag-and-drop reordering
- ✅ Error handling (auto-skip on unavailable song)

---

## Cross-References

**Related to File Upload:**
- FEAT_003_file_upload.md (feature details)
- DSGN_002_database_schema.md (songs table structure)
- SETUP_001_environment_config.md (Supabase Storage setup)

**Related to Playlist Management:**
- FEAT_001_playlist_management.md (feature details)
- DSGN_003_ui_design.md (UI for playlists)
- DSGN_002_database_schema.md (playlists and playlist_songs tables)

**Related to Music Playback:**
- FEAT_002_music_playback.md (feature details)
- DSGN_001_system_architecture.md (player component architecture)
- DSGN_003_ui_design.md (player UI layout)

**Related to Sharing:**
- FEAT_004_playlist_sharing.md (feature details)
- DSGN_002_database_schema.md (playlist_shares table, RLS policies)

---

## For Questions or Updates

If you need clarification on any document:
1. Check the DOCUMENT_RULES.md for governance
2. Refer to the recommended reading order above
3. Look at prompt logs in `07_prompt_logs/` for design decision history
4. Check cross-references for related documents

To update documentation:
1. Modify the appropriate document following DOCUMENT_RULES.md
2. Update DOCUMENT_MAP.md if structure changes
3. Create a prompt log entry in `07_prompt_logs/`
4. Commit changes to git with descriptive message

---

**STATUS: Phase 1 Complete ✅ | Phase 2 Complete ✅**

| Phase | Status | Key Files |
|-------|--------|-----------|
| **Phase 1: Foundation** | ✅ Complete | Auth, LoginPage, Supabase setup, CI/CD |
| **Phase 2a: Layout & Player** | ✅ Complete | Dashboard, TopBar, Sidebar, MusicPlayer |
| **Phase 2b: Playlist CRUD** | ✅ Complete | PlaylistsView, Modals (Add/Edit/Delete), playlistService |
| **Phase 2c: Song Library** | ✅ Complete | SongsView, song CRUD modals, songService integration |
| Phase 3: Persistence | 🔄 Coming | Playback resume, positions |
| Phase 4: Enhancements | 🔄 Coming | Repeat, shuffle, volume |
| Phase 5: Advanced | 🔄 Coming | File upload, sharing |
| Phase 6: Polish | 🔄 Coming | Testing, optimization |

**Current Live Deployment:**
```
https://chihuynhminh.github.io/podcast/
```

---

**Last Updated:** 2026-03-26 (Phase 2c Complete)
**Status:** Active - Deployed
**Version Control:** Git (see commit history for all changes)
