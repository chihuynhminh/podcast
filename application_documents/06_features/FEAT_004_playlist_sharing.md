# FEAT_004: Playlist Sharing & Access Control

**Document Type:** Feature
**Status:** Active
**Created:** 2026-03-24

---

## 1. Feature Overview

Playlist owners can share their playlists with other users. Recipients can view and listen to shared playlists but cannot edit them. Each user tracks playback independently, even in shared playlists.

---

## 2. Sharing Workflow

### Step 1: Initiate Share

**User Action:**
- User clicks [Share] button on a playlist card

**UI:**
- `<SharePlaylistModal>` opens
- Shows current sharing status
- Provides input for new recipients

**Component Flow:**
```
<PlaylistsView>
  └─ <PlaylistCard>
     ├─ [Share] button
     └─ onClick → openShareModal(playlistId)
        └─ <SharePlaylistModal playlistId={playlistId} />
```

---

### Step 2: Enter Recipient Email(s)

**Modal Interface:**
```
┌──────────────────────────────────┐
│  Share "Workout Hits"             │
├──────────────────────────────────┤
│                                   │
│  Share with:                      │
│  [_________________________]      │
│  (Comma-separated emails)         │
│                                   │
│  [Cancel]    [Share]             │
│                                   │
│  Currently Shared With:           │
│  • jane@example.com [Remove]     │
│  • bob@example.com  [Remove]     │
│                                   │
└──────────────────────────────────┘
```

**User Action:**
- User enters one or more email addresses (comma-separated)
- Example: `jane@example.com, bob@example.com`
- User clicks "Share" button

**Validation:**
- Email format validation (basic)
- Cannot share with self (validate email ≠ current user email)
- Cannot share with user already in list (check for duplicates)

---

### Step 3: Backend Processing

**Supabase Operations:**

1. **Lookup Recipients:**
   ```sql
   SELECT id FROM users WHERE email = 'jane@example.com'
   ```
   - If user exists: proceed
   - If user doesn't exist: show error "User not found"

2. **Create Share Records:**
   ```sql
   INSERT INTO playlist_shares (playlist_id, shared_by_user_id, shared_with_user_id, created_at)
   VALUES (
     'playlist-123',
     'user-owner',
     'user-jane',
     now()
   )
   ```
   - Check for duplicate shares (UNIQUE constraint)
   - If already shared: show warning "Already shared with this user"

3. **Update RLS Policies:**
   - Recipient can now SELECT the playlist
   - Recipient can SELECT songs in the playlist
   - Recipient CANNOT UPDATE/DELETE (RLS blocks write)

**Implementation:**
```typescript
const handleShare = async (emails: string[]) => {
  if (emails.length === 0) {
    showError('No emails entered');
    return;
  }

  // Validate self-share
  if (emails.includes(currentUser.email)) {
    showError('Cannot share with yourself');
    return;
  }

  setIsSharing(true);

  try {
    for (const email of emails) {
      // Validate email format
      if (!isValidEmail(email)) {
        showError(`Invalid email: ${email}`);
        continue;
      }

      // Lookup recipient
      const { data: recipient, error: lookupError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (lookupError || !recipient) {
        showError(`User not found: ${email}`);
        continue;
      }

      // Create share record
      const { error: shareError } = await supabase
        .from('playlist_shares')
        .insert({
          playlist_id: playlistId,
          shared_by_user_id: currentUser.id,
          shared_with_user_id: recipient.id,
          created_at: new Date().toISOString()
        });

      if (shareError) {
        if (shareError.code === '23505') {
          showWarning(`Already shared with ${email}`);
        } else {
          showError(`Failed to share with ${email}: ${shareError.message}`);
        }
      } else {
        showSuccess(`✅ Shared with ${email}`);
      }
    }

    // Refresh shared list
    fetchCurrentShares();
    setEmailInput('');

  } finally {
    setIsSharing(false);
  }
};

const isValidEmail = (email: string): boolean => {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
};
```

---

### Step 4: Recipient Sees Shared Playlist

**When Recipient Logs In:**
1. Frontend queries:
   ```sql
   SELECT playlists.* FROM playlists
   WHERE user_id = recipient_id
   UNION
   SELECT playlists.* FROM playlists
   JOIN playlist_shares ON playlists.id = playlist_shares.playlist_id
   WHERE playlist_shares.shared_with_user_id = recipient_id
   ```

2. Recipient's dashboard shows two sections:
   - **My Playlists** - Playlists they own (editable)
   - **Shared with Me** - Playlists from others (read-only)

**Implementation:**
```typescript
const fetchPlaylists = async () => {
  // Get user's own playlists
  const { data: ownPlaylists } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  // Get shared playlists
  const { data: sharedPlaylists } = await supabase
    .from('playlist_shares')
    .select('playlists(*)')
    .eq('shared_with_user_id', currentUser.id);

  setMyPlaylists(ownPlaylists || []);
  setSharedPlaylists(sharedPlaylists?.map(s => s.playlists) || []);
};
```

---

## 3. Recipient Experience

### What Recipients Can Do

✅ **View Playlist:**
- See playlist name, description, song list
- See number of songs
- Click to expand and browse songs

✅ **Listen to Songs:**
- Click play on any song
- Use all playback controls (play, pause, volume, progress)
- Play through entire playlist
- Use repeat/shuffle

✅ **Track Own Progress:**
- Playback position saves independently
- Resume from own last position (not owner's position)
- Multiple users listening = multiple progress tracks

✅ **See Sharing Info:**
- See who shared the playlist
- See "Shared by: Jane Smith"

### What Recipients CANNOT Do

❌ **Edit Playlist:**
- Cannot rename or change description
- Cannot delete playlist
- Cannot remove songs from it
- Cannot reorder songs
- Cannot change any metadata

❌ **Manage Sharing:**
- Cannot share with others (no re-sharing)
- Cannot unshare others (only owner can revoke)

**RLS Policies Enforce This:**
```sql
-- Recipients can SELECT (via RLS policy)
SELECT * FROM playlists WHERE shared_with_user_id = auth.uid()

-- Recipients CANNOT UPDATE
UPDATE playlists WHERE id = 'shared-playlist' -- RLS blocks (not owner)

-- Recipients CAN READ playlist_songs
SELECT * FROM playlist_songs WHERE playlist_id IN (...) -- RLS allows

-- Recipients CAN create own playback_positions
INSERT INTO playback_positions (user_id, song_id, playlist_id, current_time)
```

---

## 4. Unshare (Revoke Access)

### Owner Revoking Access

**Step-by-Step:**
1. Owner clicks [Share] on playlist
2. Modal shows "Currently Shared With:" list
3. Owner clicks [Remove] next to recipient name
4. Optional confirmation dialog
5. System deletes the `playlist_shares` record
6. Recipient's next login:
   - Playlist no longer appears in "Shared with Me"
   - Access is immediately revoked

**Implementation:**
```typescript
const handleRemoveShare = async (shareId: string, email: string) => {
  if (!confirm(`Remove access for ${email}?`)) {
    return;
  }

  try {
    const { error } = await supabase
      .from('playlist_shares')
      .delete()
      .eq('id', shareId);

    if (error) {
      showError(`Failed to remove share: ${error.message}`);
      return;
    }

    showSuccess(`✅ Removed access for ${email}`);
    fetchCurrentShares(); // Refresh list

  } catch (error) {
    showError('An error occurred');
  }
};
```

### Recipient Leaving (Optional Future Feature)

- Recipient could have [Leave] button to remove from their own list
- Would delete the `playlist_shares` record from recipient side

---

## 5. Data Model

### playlist_shares Table

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Unique record ID |
| `playlist_id` | UUID | Which playlist |
| `shared_by_user_id` | UUID | Owner (who is sharing) |
| `shared_with_user_id` | UUID | Recipient (who can access) |
| `created_at` | TIMESTAMP | When it was shared |

**Constraints:**
- UNIQUE(playlist_id, shared_with_user_id) - Can't share twice
- FK playlist_id → playlists
- FK shared_by_user_id → users
- FK shared_with_user_id → users

**RLS Policies:**
- Owner can INSERT (create shares)
- Recipient can SELECT (see they have access)
- Only owner can DELETE (revoke access)

See `DSGN_002_database_schema.md` for full schema.

---

## 6. Row-Level Security (RLS) Details

### How RLS Enables Sharing

**Scenario 1: Owner accessing own playlist**
```sql
-- User A queries playlists
SELECT * FROM playlists WHERE user_id = auth.uid()

-- RLS allows because user_id = A's ID
✅ Can see
```

**Scenario 2: Recipient accessing shared playlist**
```sql
-- User B queries playlists
SELECT * FROM playlists WHERE user_id = 'A'

-- RLS checks: is there a share record?
SELECT * FROM playlist_shares
WHERE playlist_id = 'playlist-123'
  AND shared_with_user_id = auth.uid()

-- Share exists!
✅ Can see
```

**Scenario 3: Unrelated user**
```sql
-- User C queries playlists
SELECT * FROM playlists WHERE user_id = 'A'

-- RLS checks: no share record exists
❌ Cannot see
```

**RLS Policy Code:**
```sql
-- Playlists: READ permission
CREATE POLICY "Users can see own and shared playlists"
  ON playlists FOR SELECT
  USING (
    auth.uid() = user_id  -- Owner can see own
    OR
    EXISTS (  -- Non-owner can see if shared
      SELECT 1 FROM playlist_shares
      WHERE playlist_id = id
        AND shared_with_user_id = auth.uid()
    )
  );

-- Playlists: WRITE permission
CREATE POLICY "Only owners can edit playlist"
  ON playlists FOR UPDATE, DELETE, INSERT
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Playlist_songs: READ permission
CREATE POLICY "Can read songs in accessible playlists"
  ON playlist_songs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND (
        user_id = auth.uid()  -- Own it
        OR
        EXISTS (  -- Or it's shared with me
          SELECT 1 FROM playlist_shares
          WHERE playlist_id = id
            AND shared_with_user_id = auth.uid()
        )
      )
    )
  );

-- Playlist_songs: WRITE permission (only owner)
CREATE POLICY "Only owner can modify songs"
  ON playlist_songs FOR INSERT, UPDATE, DELETE
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

---

## 7. Frontend Components

### Component: SharePlaylistModal

```typescript
interface SharePlaylistModalProps {
  playlistId: string;
  onClose: () => void;
  onShared?: () => void;
}

const SharePlaylistModal: React.FC<SharePlaylistModalProps> = ({
  playlistId,
  onClose,
  onShared
}) => {
  const [newEmails, setNewEmails] = useState('');
  const [currentShares, setCurrentShares] = useState<ShareInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCurrentShares();
  }, [playlistId]);

  const fetchCurrentShares = async () => {
    const { data } = await supabase
      .from('playlist_shares')
      .select('id, shared_with_user_id, users!shared_with_user_id(email)')
      .eq('playlist_id', playlistId);

    setCurrentShares(data || []);
  };

  const handleShare = async () => {
    // Validate and share...
    // See implementation above
  };

  const handleRemoveShare = async (shareId: string, email: string) => {
    // Revoke access...
    // See implementation above
  };

  return (
    <Modal onClose={onClose}>
      <h2>Share Playlist</h2>
      <input
        value={newEmails}
        onChange={e => setNewEmails(e.target.value)}
        placeholder="Email addresses (comma-separated)"
      />
      <button onClick={handleShare} disabled={isLoading}>
        Share
      </button>

      <h3>Currently Shared With:</h3>
      {currentShares.length === 0 ? (
        <p>Not shared with anyone yet</p>
      ) : (
        <ul>
          {currentShares.map(share => (
            <li key={share.id}>
              {share.users.email}
              <button onClick={() => handleRemoveShare(share.id, share.users.email)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};
```

---

## 8. UI States

### Playlist Card: Shared Indicator

```
┌────────────────────────────┐
│ Workout Hits               │
│ 12 songs                   │
│ Shared with 2 users 👥     │  ← Indicator
│ [Edit][Delete][Share]      │
└────────────────────────────┘
```

### Shared Playlist in Recipient's View

```
┌────────────────────────────┐
│ Workout Hits               │
│ (Shared by Jane Smith)     │  ← Shows owner
│ 12 songs                   │
│ [View] [Play]              │  ← Read-only buttons
└────────────────────────────┘
```

---

## 9. Error Handling

| Error | Message | Action |
|-------|---------|--------|
| User not found | "User '{email}' not found in system" | Clear input, prompt to verify email |
| Already shared | "Already shared with '{email}'" | Show warning, skip |
| Invalid email | "'{email}' is not a valid email address" | Highlight invalid email |
| Self-share | "Cannot share with yourself" | Clear input |
| Network error | "Failed to share. Retrying..." | Auto-retry |
| RLS violation | "You don't have permission to share this" | Disable share button, show message |

---

## 10. Testing Checklist

- [ ] Share playlist with one user
- [ ] Share playlist with multiple users (comma-separated)
- [ ] Share shows current recipients
- [ ] Remove/revoke access for a recipient
- [ ] Cannot self-share (error/validation)
- [ ] Cannot share twice with same user (error)
- [ ] Recipient sees shared playlist after owner shares
- [ ] Recipient sees "Shared by" indicator
- [ ] Recipient can play sorted in shared playlist
- [ ] Recipient can track own playback position
- [ ] Recipient cannot edit shared playlist
- [ ] Recipient cannot delete shared playlist
- [ ] Recipient cannot reorder songs
- [ ] Owner revokes access, recipient loses access
- [ ] Non-existent email shows error
- [ ] Invalid email format shows error
- [ ] Share button disabled while saving
- [ ] Success notification appears after sharing

---

## 11. Future Enhancements

- **Revoke from Recipient:** Let recipients choose to "leave" shared playlist
- **Share By Link:** Generate shareable links (no email needed)
- **Permissions:** Granular permissions (edit, view-only, comment)
- **Collaborative:** Allow recipients to suggest songs
- **Notifications:** Notify owner when recipient starts playing
- **Group Playlists:** Multiple users can be editors (collaborative)

---

**Cross-References:**
- `DSGN_002_database_schema.md` - playlist_shares table, RLS policies
- `DSGN_003_ui_design.md` - SharePlaylistModal UI
- `FEAT_001_playlist_management.md` - Playlist management features
- `FEAT_002_music_playback.md` - Playback in shared playlists

**Last Updated:** 2026-03-24
**Status:** Approved
