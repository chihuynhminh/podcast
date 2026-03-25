# DSGN_003: User Interface & User Experience Design

**Document Type:** Design
**Status:** Active
**Created:** 2026-03-24

---

## 1. UI Overview & Layout Framework

### Main Layout Structure (After Login)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Top Bar                                  │
│  Logo / App Title                          User Menu (Logout)    │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                    │
│   Sidebar    │              Main Content Area                    │
│              │         (Dynamic based on menu)                   │
│  • Playlists │                                                    │
│  • Songs     │                                                    │
│              │                                                    │
│              │                                                    │
│              │                                                    │
├──────────────┴──────────────────────────────────────────────────┤
│                    Music Player (Bottom Bar)                      │
│  [Play] [<< >>] [Volume] [Progress] [Repeat] [Shuffle]          │
└─────────────────────────────────────────────────────────────────┘
```

### Layout Dimensions
- **Sidebar Width:** 250px (fixed)
- **Top Bar Height:** 60px (fixed)
- **Player Height:** 80px (fixed)
- **Main Content:** Fill remaining space

### Responsive Design
- **Desktop (1200px+):** Full layout as shown
- **Tablet (768px-1199px):** Sidebar collapses to icon menu
- **Mobile (< 768px):** Sidebar drawer (slide-out), player adapted

---

## 2. Page: Login Page

**Route:** `/login`
**Visibility:** Public (before authentication)
**Purpose:** User authentication entry point

### Layout
```
┌────────────────────────────────────────────┐
│                                            │
│                                            │
│            Music Player Logo               │
│            (or App Title)                  │
│                                            │
│         Login Form:                        │
│         ┌──────────────────────────┐      │
│         │ Email: [_____________]   │      │
│         │ Password: [____________] │      │
│         │ [      Login Button   ]  │      │
│         │ [     Forgot Password ]  │      │
│         └──────────────────────────┘      │
│                                            │
└────────────────────────────────────────────┘
```

### Components
- **Header:** App logo or title image
- **Email Input:** Text field (type="email")
- **Password Input:** Text field (type="password")
- **Login Button:** CTA button (enabled/disabled based on form validity)
- **Forgot Password:** Link (optional, future feature)
- **Error Messages:** Display below form if login fails

### Interactions
- Email/password validation on blur
- Login button disabled until both fields filled
- Show spinner on login button during request
- Display error message if credentials invalid
- Redirect to Dashboard on successful login

### Error Handling
- "Invalid email or password" - generic message
- "Network error, please try again" - if connection fails
- "Server error, please try again later" - if Supabase is down

---

## 3. Page: Dashboard (Main Application)

**Route:** `/dashboard` or `/` (after login)
**Visibility:** Protected (authenticated users only)
**Structure:** Master-detail layout (sidebar + main content + player)

---

## 3.1 Sidebar Menu

**Component:** `<Sidebar />`

```
┌──────────────────────────┐
│  [≡] Music Player App    │  (collapsible on mobile)
├──────────────────────────┤
│                          │
│  ► Playlists             │    (clickable, shows all playlists)
│    - Workout Hits        │    (sub-items, optional sub-menu)
│    - Focus Music         │
│    - Relaxation         │
│                          │
│  ► Songs                 │    (clickable, shows song library)
│                          │
│  ► Shared with Me        │    (optional, shows shared playlists)
│                          │
├──────────────────────────┤
│                          │
│  User: john@email.com    │    (user info)
│  [Logout]                │    (logout button)
│                          │
└──────────────────────────┘
```

### Menu Items
1. **Playlists** - Main navigation item
   - Click to show all playlists
   - Sub-items: Show recently accessed playlists (optional)

2. **Songs** - Main navigation item
   - Click to show entire song library

3. **Shared with Me** (optional)
   - Show playlists shared by other users
   - Only visible if user has shared playlists

### User Info Section
- Display current user email
- Logout button

---

## 3.2 Main Content Area: Playlists View

**Component:** `<PlaylistsView />`
**Triggered by:** Clicking "Playlists" in sidebar

```
┌─────────────────────────────────────────────────┐
│  My Playlists                [+ Add Playlist]   │
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌────────────────┐  ┌────────────────┐         │
│  │ Workout Hits   │  │ Focus Music    │         │
│  │ 12 songs       │  │ 15 songs       │         │
│  │ [Edit][Delete] │  │ [Edit][Delete] │         │
│  │ [Share]        │  │ [Share]        │         │
│  └────────────────┘  └────────────────┘         │
│                                                   │
│  ┌────────────────┐  ┌────────────────┐         │
│  │ Relaxation     │  │ Party Vibes    │         │
│  │ 20 songs       │  │ 8 songs        │         │
│  │ [Edit][Delete] │  │ [Edit][Delete] │         │
│  │ [Share]        │  │ [Share]        │         │
│  └────────────────┘  └────────────────┘         │
│                                                   │
│  [Shared with Me Section - if applicable]       │
│                                                   │
└─────────────────────────────────────────────────┘
```

### Playlist Card
- **Playlist Name** (clickable to expand) - Bold, large text
- **Song Count** - "16 songs"
- **Action Buttons:**
  - [Edit] - Opens `<EditPlaylistModal />`
  - [Delete] - Deletes playlist with confirmation
  - [Share] - Opens `<SharePlaylistModal />`
- **Click Anywhere Else:** Expands to show songs in playlist

### "Add Playlist" Button
- Positioned at top right
- Click opens `<AddPlaylistModal />`

### Shared with Me Section
- Shows playlists that other users shared
- Same layout as "My Playlists"
- Songs in shared playlists are read-only (no delete, reorder)

---

## 3.3 Main Content Area: Playlists Expanded (Playlist Detail)

**Component:** `<PlaylistDetail />`
**Triggered by:** Clicking a playlist card to expand

```
┌──────────────────────────────────────────────┐
│  < Workout Hits  [Edit] [Delete] [Share]     │
├──────────────────────────────────────────────┤
│                                               │
│  Song List (Reorderable):                    │
│  ┌──────────────────────────────────────┐   │
│  │ 1. Beautiful Day            02:45     │   │ (draggable)
│  │    The Band                           │   │
│  │                                       │   │
│  │ 2. Wonderwall                03:12    │   │
│  │    Oasis                              │   │
│  │                                       │   │
│  │ 3. Wake Me Up              04:09     │   │
│  │    Ed Sheeran                         │   │
│  │                                       │   │
│  │ ...                                   │   │
│  └──────────────────────────────────────┘   │
│                                               │
│  [+ Add Song to Playlist]                    │
│                                               │
└──────────────────────────────────────────────┘
```

### Song List Features
- **Drag-and-Drop Reordering:** Click and drag to reorder
- **Song Item Shows:**
  - Position number (auto-increment)
  - Song title (bold)
  - Artist name (smaller text)
  - Duration (right-aligned)
  - Delete button (on hover or always visible)
- **Click Song:** Plays it (shows in player)

### "Add Song to Playlist" Button
- Opens dialog to select songs from library
- Shows checkboxes for each song
- Can select multiple songs at once

---

## 3.4 Main Content Area: Songs View

**Component:** `<SongsView />`
**Triggered by:** Clicking "Songs" in sidebar

```
┌──────────────────────────────────────────────┐
│  Song Library               [+ Add Song]      │
├──────────────────────────────────────────────┤
│                                               │
│  ┌──────────────────────────────────────┐   │
│  │ Beautiful Day                 local   │   │
│  │ The Band              02:45  [Edit]   │   │
│  │                             [Delete]  │   │
│  ├──────────────────────────────────────┤   │
│  │ Wonderwall                    local   │   │
│  │ Oasis                  03:12  [Edit]  │   │
│  │                             [Delete]  │   │
│  ├──────────────────────────────────────┤   │
│  │ Smoke on the Water      URL   [Edit]  │   │
│  │ Deep Purple             03:45 [Delete] │   │
│  │                                       │   │
│  │ ...                                   │   │
│  └──────────────────────────────────────┘   │
│                                               │
└──────────────────────────────────────────────┘
```

### Song List Features
- **Sortable Columns:**
  - Title, Artist, Duration, Source (local/URL)
- **Song Item Shows:**
  - Title (bold)
  - Artist (below or same row)
  - Duration (right)
  - Source Type (icon: 🎵 for local, 🌐 for URL)
  - [Edit] button
  - [Delete] button
- **Click Song Title:** Plays it (shows in player) OR opens edit modal

### "Add Song" Button
- Top right
- Opens `<AddSongModal />`

---

## 3.5 Music Player (Bottom Bar)

**Component:** `<MusicPlayer />`
**Position:** Fixed at bottom of viewport
**Height:** 80px

```
┌────────────────────────────────────────────────────────────────┐
│  Beautiful Day - The Band (Workout Hits)                       │
│  [◀ ▶] [▶  ⏸] [⏫] [━━━━━●─────────] [02:45 / 03:00]          │
│  [Loop: ↻] [🔀] [🔊 ━━━○]                                     │
└────────────────────────────────────────────────────────────────┘
```

### Components (Left to Right)

1. **Song Info Section**
   - Current Song Title (bold)
   - Artist Name
   - Current Playlist Name (smaller)

2. **Previous/Next Buttons**
   - [◀ (Previous)] - Skip to previous song
   - [Next ▶] - Skip to next song

3. **Play/Pause Button**
   - Large button in center
   - Shows ▶ when paused, ⏸ when playing
   - Click to toggle play/pause

4. **Progress Bar**
   - Visual timeline of song duration
   - Shows current position as circle/dot
   - Click anywhere to seek
   - Time display:
     - Left: "02:45" (current time)
     - Right: "03:00" (total duration)

5. **Volume Control**
   - Volume icon (🔊)
   - Slider (horizontal)
   - Mute button (optional)

6. **Repeat Mode Button**
   - Shows current mode: none (↻), repeat all (↻ with "1"), repeat one (↻ 1)
   - Click to cycle: none → all → one → none
   - Visual indicator of current state

7. **Shuffle Button**
   - Toggle button (🔀)
   - On: Highlighted/active color
   - Off: Grayed out

### Interactions
- **Progress Bar Click:** Seek to position tapped
- **Previous/Next Buttons:** Navigate playlist
- **Play/Pause:** Toggle playback
- **Repeat Button:** Cycle repeat modes
- **Shuffle Button:** Toggle shuffle on/off
- **Volume Slider:** Change volume (0-100%)

---

## 4. Modal Dialogs

### 4.1 Modal: Add Playlist

**Component:** `<AddPlaylistModal />`
**Trigger:** Click "+ Add Playlist" button

```
┌─────────────────────────────────────┐
│  Create New Playlist         [X]     │
├─────────────────────────────────────┤
│                                      │
│  Playlist Name:                      │
│  [____________________________]      │
│                                      │
│  Description (optional):             │
│  [____________________________]      │
│  [____________________________]      │
│                                      │
│  [Cancel]          [Create]         │
│                                      │
└─────────────────────────────────────┘
```

### Fields
- **Playlist Name** (required) - Text input
- **Description** (optional) - Text area

### Buttons
- [Cancel] - Close modal without saving
- [Create] - Create playlist and close

---

### 4.2 Modal: Edit Playlist

**Component:** `<EditPlaylistModal />`
**Trigger:** Click [Edit] on playlist card

```
┌─────────────────────────────────────┐
│  Edit Playlist              [X]     │
├─────────────────────────────────────┤
│                                      │
│  Playlist Name:                      │
│  [____________________________]      │
│                                      │
│  Description (optional):             │
│  [____________________________]      │
│  [____________________________]      │
│                                      │
│  [Cancel]    [Save]    [Delete]     │
│                                      │
└─────────────────────────────────────┘
```

### Fields (Pre-filled)
- **Playlist Name** - Change name
- **Description** - Change description

### Buttons
- [Cancel] - Close without saving
- [Save] - Update playlist
- [Delete] - Delete playlist (with confirmation)

---

### 4.3 Modal: Share Playlist

**Component:** `<SharePlaylistModal />`
**Trigger:** Click [Share] on playlist card

```
┌─────────────────────────────────────┐
│  Share Playlist              [X]     │
├─────────────────────────────────────┤
│                                      │
│  Share "Workout Hits" with:          │
│                                      │
│  Email Addresses (comma-separated):  │
│  [____________________________]      │
│  [____________________________]      │
│                                      │
│  [Cancel]         [Share]           │
│                                      │
│  Currently Shared With:              │
│  • jane@example.com [Revoke]        │
│  • bob@example.com  [Revoke]        │
│                                      │
└─────────────────────────────────────┘
```

### Features
- **Input Field:** Comma-separated email addresses
- **Share Button:** Adds emails to share list
- **Currently Shared With Section:**
  - Shows users this playlist is already shared with
  - [Revoke] button on each to unshare

---

### 4.4 Modal: Add Song to Playlist

**Component:** `<AddSongModal />`
**Trigger:** Click "+ Add Song to Playlist" in playlist detail

```
┌─────────────────────────────────────┐
│  Add Songs to Playlist      [X]     │
├─────────────────────────────────────┤
│                                      │
│  Available Songs:                    │
│  [Search: _________________]         │
│                                      │
│  ☐ Beautiful Day - The Band         │
│  ☐ Wonderwall - Oasis               │
│  ☐ Wake Me Up - Ed Sheeran          │
│  ☐ Smoke on the Water - Deep Purple │
│  ☐ ...                               │
│                                      │
│  [Cancel]        [Add Selected]     │
│                                      │
└─────────────────────────────────────┘
```

### Features
- **Search Box:** Filter songs by title/artist
- **Checkboxes:** Select multiple songs
- **Add Selected Button:** Add all checked songs to playlist
- **Excludes:** Songs already in the playlist

---

### 4.5 Modal: Add/Upload Song

**Component:** `<AddSongModal />`
**Trigger:** Click "+ Add Song" in Songs view

```
┌─────────────────────────────────────┐
│  Add Song                    [X]     │
├─────────────────────────────────────┤
│                                      │
│  Upload Local File  or  Add URL?     │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ [►] Upload Local File          │  │
│  ├────────────────────────────────┤  │
│  │ Title: [_________________]     │  │
│  │ Artist: [_________________]    │  │
│  │ File: [Choose File] [filename] │  │
│  │                                 │  │
│  │ [Cancel]      [Upload]         │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ [►] Add URL                    │  │
│  ├────────────────────────────────┤  │
│  │ Title: [_________________]     │  │
│  │ Artist: [_________________]    │  │
│  │ URL: [_______________________] │  │
│  │ (e.g., https://...)            │  │
│  │                                 │  │
│  │ [Cancel]         [Add]         │  │
│  └────────────────────────────────┘  │
│                                      │
└─────────────────────────────────────┘
```

### Two Sections (Expandable)

**Section 1: Upload Local File**
- Title (auto-fill from filename, editable)
- Artist (manual input)
- File picker ([Choose File])
- [Cancel] [Upload] buttons

**Section 2: Add URL**
- Title (manual input)
- Artist (manual input)
- URL (HTTPS only)
- [Cancel] [Add] buttons

---

## 5. Color & Typography Scheme

### Color Palette
- **Primary Color:** #1DB954 (Spotify Green - music industry standard)
- **Secondary Color:** #191414 (Dark Gray/Black)
- **Background:** #FFFFFF (White) or #F5F5F5 (Light Gray)
- **Text:** #000000 (Black) or #333333 (Dark Gray)
- **Borders:** #E0E0E0 (Light Gray)
- **Success:** #22C55E (Green)
- **Error:** #EF4444 (Red)
- **Warning:** #FFA500 (Orange)

### Typography
- **Headlines:** Sans-serif (e.g., Segoe UI, Roboto)
  - H1: 32px, Bold
  - H2: 24px, Bold
  - H3: 18px, Semi-bold
- **Body Text:** Sans-serif
  - Body: 14px, Regular
  - Small: 12px, Regular
- **Buttons:** 14px, Semi-bold, ALL CAPS (optional)

---

## 6. Interactive States & Transitions

### Button States
- **Default:** Background color, visible border
- **Hover:** Slightly darker background, cursor pointer
- **Active/Pressed:** Even darker, slight inset shadow
- **Disabled:** Grayed out, cursor not-allowed

### Input Field States
- **Empty:** Placeholder text visible
- **Focused:** Border color changes to primary color
- **Filled:** Normal border, value visible
- **Error:** Red border, error message below

### Modal Behavior
- **Open:** Fade in background overlay, slide down modal
- **Close:** Fade out, slide up
- **Duration:** 200-300ms transitions

---

## 7. User Flows & Navigation

### Flow 1: Creating a Playlist & Adding Songs

```
1. User clicks "+ Add Playlist"
   → <AddPlaylistModal> opens
2. User enters name, clicks "Create"
   → Modal closes, playlist appears in list
3. User clicks on new playlist to expand
   → <PlaylistDetail> shows empty playlist
4. User clicks "+ Add Song"
   → <AddSongModal> opens
5. User uploads/adds songs
   → Modal closes, songs appear in list
6. User can drag to reorder
7. User clicks a song to play it
   → <MusicPlayer> shows song info and plays
```

### Flow 2: Sharing a Playlist

```
1. User clicks [Share] on playlist
   → <SharePlaylistModal> opens
2. User enters recipient email(s)
3. User clicks "Share"
   → Recipient added to share list
   → Modal shows "Currently Shared With"
4. Recipient logs in and sees playlist in "Shared with Me"
5. Recipient can play but not edit
```

### Flow 3: Resuming Playback

```
1. User plays song from playlist
   → Player loads saved position (if exists)
   → Audio element starts from that position
2. User pauses
   → Frontend auto-saves position every 5-10 seconds (already running)
3. User closes browser/tab
4. User returns later, logs in
5. User selects same playlist
6. User plays same song
   → Player loads saved position
   → Resumes from exact spot
```

---

## 8. Accessibility Considerations

### WCAG 2.1 Level AA Compliance

- **Color Contrast:** All text meets minimum 4.5:1 contrast ratio
- **Keyboard Navigation:** All interactive elements accessible via Tab key
- **ARIA Labels:** All interactive elements have proper labels
- **Focus Indicators:** Visible focus ring on all buttons/inputs
- **Icon + Text:** Icons paired with text labels
- **Semantic HTML:** Use `<button>`, `<input>`, `<label>` properly
- **Screen Reader:** Use ARIA roles, alt text, live regions

### Example ARIA Implementation
```html
<button aria-label="Play music" onClick={handlePlay}>
  ▶
</button>

<input aria-label="Search songs" placeholder="Search..." />

<div role="status" aria-live="polite">
  Song added to playlist
</div>
```

---

## 9. Error States & Empty States

### Empty States

**No Playlists Yet:**
```
┌────────────────────────────────────┐
│  No Playlists Yet                  │
│                                    │
│  Create your first playlist to get │
│  started organizing your music.    │
│                                    │
│  [+ Create Playlist]               │
│                                    │
└────────────────────────────────────┘
```

**Playlist Empty (No Songs):**
```
┌────────────────────────────────────┐
│  Workout Hits is Empty             │
│                                    │
│  Add songs from your library to    │
│  build this playlist.              │
│                                    │
│  [+ Add Songs]                     │
│                                    │
└────────────────────────────────────┘
```

### Error States

**Failed to Upload File:**
```
✗ Error uploading file
File size exceeds 100 MB limit
[Try Again]
```

**Failed to Play Song:**
```
⚠️ Song unavailable
Skipping to next song...
```

---

## 10. Responsive Behavior

### Desktop (1200px+)
- Full layout as designed
- Sidebar always visible
- Modals centered on screen

### Tablet (768px-1199px)
- Sidebar collapses to icon menu (left side)
- Main content takes more space
- Modals full-width with padding
- Player adapts to smaller screen

### Mobile (< 768px)
- Sidebar drawer (hamburger menu, slide from left)
- Full-width main content
- Player simplified (smaller buttons, less controls)
- Modals full-screen with close button at top
- Touch-friendly button sizes (minimum 44x44px)

---

**Cross-References:**
- `DSGN_001_system_architecture.md` - Component architecture
- `DSGN_002_database_schema.md` - Data behind UI
- `FEAT_002_music_playback.md` - Player behavior details

**Last Updated:** 2026-03-24
**Status:** Approved
