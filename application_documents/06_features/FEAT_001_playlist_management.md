# FEAT_001: Playlist Management

**Document Type:** Feature
**Status:** Active
**Created:** 2026-03-24

---

## 1. Feature Overview

Users can create, organize, and manage multiple playlists. Each playlist can contain multiple songs and can be shared with other users.

---

## 2. User Workflows

### Workflow 1: Create a New Playlist

**Step-by-Step:**
1. User clicks "+ Add Playlist" button in Playlists view
2. Modal dialog opens (`<AddPlaylistModal />`)
3. User enters:
   - Playlist name (required, 1-255 characters)
   - Description (optional, 0-500 characters)
4. User clicks "Create" button
5. System creates new `playlists` record in database
6. Modal closes
7. New playlist appears in playlists list
8. User can immediately add songs to it

**Success Criteria:**
✅ Playlist appears instantly after creation
✅ Name is editable immediately
✅ Empty playlist shows "No songs yet" message
✅ User can delete or share immediately after creation

---

### Workflow 2: Edit Playlist Name/Description

**Step-by-Step:**
1. User clicks [Edit] button on a playlist card
2. Modal dialog opens (`<EditPlaylistModal />`)
3. Modal pre-fills current name and description
4. User modifies name and/or description
5. User clicks "Save" button
6. System updates `playlists` record in database
7. Modal closes
8. Updated name appears in playlists list

**Success Criteria:**
✅ Existing values pre-fill
✅ Changes save instantly to database
✅ UI updates immediately
✅ Can clear name/description (empty string allowed for description)

---

### Workflow 3: Delete a Playlist

**Step-by-Step:**
1. User clicks [Delete] button on playlist card OR in [Edit] modal
2. Confirmation dialog appears:
   ```
   "Delete 'Workout Hits'?"
   This action cannot be undone.
   [Cancel] [Delete]
   ```
3. User clicks "Delete" to confirm
4. System deletes:
   - All `playlist_songs` records for this playlist
   - The `playlists` record itself
   - All `playback_positions` for songs in this playlist
5. Modal closes
6. Playlist disappears from list

**Success Criteria:**
✅ Confirmation required (prevent accidental deletion)
✅ All related records deleted (cascade)
✅ If playlist was shared, shares are revoked
✅ User receives confirmation message ("Playlist deleted")

---

### Workflow 4: Add Songs to a Playlist

**Step-by-Step:**
1. User clicks on a playlist card to expand it → `<PlaylistDetail />`
2. User clicks "[+ Add Song to Playlist]" button
3. Modal opens (`<AddSongModal />`) showing available songs from library
4. User can:
   - Search/filter songs
   - Select multiple songs (checkboxes)
5. User clicks [Add Selected] button
6. System:
   - Inserts records into `playlist_songs` table
   - Calculates next `position` (1, 2, 3...)
   - Assigns positions to new songs
7. Modal closes
8. Songs appear in playlist with their positions

**Success Criteria:**
✅ Songs already in playlist are hidden (can't add twice)
✅ Multiple songs can be added at once
✅ Positions are calculated correctly (sequential)
✅ Drag-and-drop reordering works after adding

---

### Workflow 5: Remove a Song from Playlist

**Step-by-Step:**
1. User views expanded playlist (`<PlaylistDetail />`)
2. User clicks [Delete] button next to a song
3. Optional: Show confirmation: "Remove from playlist?"
4. System:
   - Deletes the `playlist_songs` record
   - Does NOT delete from `songs` table (song remains in library)
   - Recalculates positions for remaining songs
5. Song disappears from playlist list

**Success Criteria:**
✅ Song stays in library (only removed from this playlist)
✅ Positions are recalculated (no gaps in numbering)
✅ Deletion is instant (no spinner)
✅ All playlists are updated if song is in multiple playlists

---

### Workflow 6: Reorder Songs in Playlist (Drag-and-Drop)

**Step-by-Step:**
1. User views expanded playlist (`<PlaylistDetail />`)
2. User sees `<SongList>` with songs in order
3. User clicks and drags a song to new position
4. UI shows drag preview (semi-transparent, offset)
5. User drops the song at new position
6. System:
   - Detects new position
   - Updates `position` column for affected songs
   - Saves to database immediately
7. Song reorders visually
8. Playback order follows new order

**Success Criteria:**
✅ Drag-and-drop is smooth (React Beautiful DND or similar)
✅ Visual feedback during drag (cursor, highlight)
✅ Positions saved immediately to database
✅ No manual "Save" button needed
✅ Works on desktop, less critical on mobile (could hide)

---

### Workflow 7: Share a Playlist

**Step-by-Step:**
1. User clicks [Share] button on a playlist card
2. Modal opens (`<SharePlaylistModal />`)
3. Modal shows:
   - Input field for recipient email(s) (comma-separated)
   - Current list of users it's shared with
4. User enters email(s) and clicks "Share"
5. System:
   - Looks up recipient email in `users` table (by email)
   - Creates record in `playlist_shares` table
   - If recipient doesn't exist, show error: "User not found"
6. Modal updates to show new recipient in sharing list
7. Next time recipient logs in, they see playlist in "Shared with Me"

**Success Criteria:**
✅ Can share with multiple users
✅ Shared-with section shows current recipients
✅ Can't share with non-existent users (error handling)
✅ Recipient sees read-only playlist immediately
✅ Can never share with yourself (validate)

---

### Workflow 8: View Shared Playlist (as Recipient)

**Step-by-Step:**
1. User A shares "Workout Hits" with User B
2. User B logs in
3. In Playlists view, User B sees:
   - "My Playlists" section (User B's own playlists)
   - "Shared with Me" section (playlists from others)
4. User B can:
   - Click to expand and view songs
   - Click a song to play it
   - Track their own playback position
   - BUT cannot:
     - Edit playlist name/description
     - Add/remove songs
     - Delete playlist
     - Change song order
5. Playback positions are independent (User B's playback doesn't affect User A's)

**Success Criteria:**
✅ Shared playlists appear in separate section
✅ Shared playlists are clearly marked as shared
✅ Read-only RLS policies prevent edits
✅ Each user's playback position is independent

---

### Workflow 9: Unshare (Revoke Access)

**Step-by-Step:**
1. User clicks [Share] on their playlist
2. Modal shows list of users with access
3. User clicks [Revoke] next to a user
4. Optional confirmation: "Remove access for this user?"
5. System deletes the `playlist_shares` record
6. Recipient no longer sees the playlist in "Shared with Me"
7. Modal updates immediately

**Success Criteria:**
✅ Revoke is instant
✅ Recipient is immediately locked out (next time they refresh)
✅ No lingering access

---

## 3. Data Model References

**Primary Tables:**
- `playlists` - Playlist records
- `playlist_songs` - Songs in each playlist
- `playlist_shares` - Who can access each playlist

See `DSGN_002_database_schema.md` for complete schema.

---

## 4. Business Logic & Rules

### Playlist Creation Rules
- Name is required (1-255 chars)
- Description is optional (0-500 chars)
- User can create unlimited playlists
- Playlist is private by default
- Playlists indexed by `user_id` (fast filtering)

### Song Ordering Rules
- Positions are sequential integers (1, 2, 3...)
- When adding songs, calculate max(position) + 1
- When removing songs, renumber remaining songs
- When dragging, update all affected songs' positions atomically
- Display is always sorted by `position` column

### Sharing Rules
- Only playlist owner can share
- Can share with multiple users
- Shared playlists are read-only for recipients
- Owner is always the editor, recipients are always viewers
- Sharing doesn't share the songs themselves (those remain private)
- Owner can unshare anytime
- No transitive sharing (User B cannot re-share User A's playlist)

### Deletion Cascades
- Delete `playlists` → delete all `playlist_songs` → cascades to delete related `playback_positions`
- Delete `playlists` → delete all `playlist_shares` for that playlist
- Delete `songs` → remove from all playlists

---

## 5. UI Components

**Main Components:**
- `<PlaylistsView />` - List of playlists
- `<PlaylistDetail />` - Expanded view with songs
- `<SongList />` - Reorderable song list
- `<PlaylistCard />` - Individual playlist card

**Modals:**
- `<AddPlaylistModal />`
- `<EditPlaylistModal />`
- `<SharePlaylistModal />`
- `<AddSongModal />`

See `DSGN_003_ui_design.md` for detailed UI specs.

---

## 6. Error Handling

| Error | Message | Action |
|-------|---------|--------|
| Name too long | "Playlist name must be 255 characters or less" | Clear form, refocus input |
| Duplicate share | "Already shared with this user" | Show warning, don't create duplicate |
| User not found | "User not found (email not in system)" | Clear input, show error |
| Network error | "Failed to save. Retrying..." | Auto-retry every 5 seconds |
| RLS violation | "You don't have permission to edit this playlist" | Disable edit buttons, show message |

---

## 7. Performance Considerations

- **Listing playlists:** Index on `user_id` ensures fast queries
- **Loading songs in playlist:** Index on `playlist_id` ensures fast joins
- **Reordering songs:** Update multiple `position` values in one transaction
- **Sharing:** Simple lookup on `email` - consider UNIQUE index

---

## 8. Testing Checklist

- [ ] Create playlist with name only
- [ ] Create playlist with name + description
- [ ] Edit playlist name and description
- [ ] Delete playlist with confirmation
- [ ] Add songs to empty playlist
- [ ] Add multiple songs at once
- [ ] Remove song from playlist
- [ ] Drag and reorder songs
- [ ] Verify positions are sequential after reordering
- [ ] Share playlist with valid user
- [ ] Attempt to share with non-existent user (error)
- [ ] Recipient sees shared playlist
- [ ] Recipient cannot edit shared playlist
- [ ] Unshare playlist (revoke access)
- [ ] Verify shared playlist disappears for recipient

---

**Cross-References:**
- `DSGN_002_database_schema.md` - Table structure
- `DSGN_003_ui_design.md` - UI/UX details
- `DSGN_001_system_architecture.md` - Service layer (playlistService)

**Last Updated:** 2026-03-24
**Status:** Approved
