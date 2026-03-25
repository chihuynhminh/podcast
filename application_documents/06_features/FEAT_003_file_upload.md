# FEAT_003: File Upload & Song Management

**Document Type:** Feature
**Status:** Active
**Created:** 2026-03-24

---

## 1. Feature Overview

Users can add music to their library in two ways:
1. Upload local audio files to Supabase Storage
2. Add streaming URLs (HTTPS links)

Both approaches create a `songs` record in the database with metadata.

---

## 2. Workflow: Upload Local Audio File

### Step-by-Step Process

**Step 1: User Opens "Add Song" Dialog**
1. User clicks "+ Add Song" button in Songs view
2. Modal appears with two sections:
   - Section 1: Upload Local File
   - Section 2: Add URL
3. User clicks [▼] to expand "Upload Local File"

**Step 2: Select File**
1. User clicks "Choose File" button
2. File picker opens (filtered to audio types: .mp3, .wav, .ogg, .m4a, .flac, .aac)
3. User selects one audio file
4. Filename appears in the form

**Step 3: Edit Metadata** (Optional)
1. Auto-filled fields from file metadata (optional):
   - Title (from ID3 tags or filename)
   - Artist (from ID3 tags or empty)
2. User can manually edit these fields
3. Duration is calculated when file is selected (using Web Audio API)

**Step 4: Upload**
1. User clicks "Upload" button
2. Frontend:
   - Validates file type (must be audio)
   - Validates file size (< 100MB recommended)
   - Shows upload progress (percentage or spinner)
3. Supabase Storage:
   - Receives file upload
   - Stores at path: `users/{user_id}/songs/{uuid}-{original_filename}`
   - Returns secure/signed URL
4. Frontend:
   - Creates `songs` record in database with:
     - `source_type` = 'local_file'
     - `file_path` = storage path
     - `url` = signed URL from Supabase
     - `title`, `artist` from form
     - `duration_seconds` calculated
   - Shows success message: "✅ Song uploaded successfully"
5. Modal closes
6. New song appears in song library

### Implementation Details

**File Selection & Metadata Extraction:**
```typescript
const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file type
  const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac'];
  if (!validTypes.includes(file.type)) {
    showError('Invalid file type. Upload only audio files.');
    return;
  }

  // Validate file size (100MB max)
  if (file.size > 100 * 1024 * 1024) {
    showError('File too large. Maximum 100 MB.');
    return;
  }

  // Extract metadata (title from filename, optional: ID3 tags via music-metadata library)
  const title = file.name.split('.')[0]; // Remove extension
  setFormData({ ...formData, title, filename: file.name });

  // Calculate duration using File API
  const audioContext = new AudioContext();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const duration = audioBuffer.duration;
  setFormData(prev => ({ ...prev, duration_seconds: Math.floor(duration) }));
};
```

**Upload to Supabase Storage:**
```typescript
const handleUpload = async () => {
  const file = fileInputRef.current?.files?.[0];
  if (!file) {
    showError('No file selected');
    return;
  }

  setIsUploading(true);

  try {
    // Generate unique filename
    const uniqueName = `${uuid()}-${file.name}`;
    const filepath = `users/${currentUser.id}/songs/${uniqueName}`;

    // Upload to storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('songs')
      .upload(filepath, file);

    if (storageError) {
      showError(`Upload failed: ${storageError.message}`);
      return;
    }

    // Get signed URL (valid for 1 year)
    const { data: signedUrl } = await supabase
      .storage
      .from('songs')
      .createSignedUrl(filepath, 60 * 60 * 24 * 365); // 1 year

    // Create database record
    const { error: dbError } = await supabase
      .from('songs')
      .insert({
        user_id: currentUser.id,
        title: formData.title,
        artist: formData.artist || null,
        source_type: 'local_file',
        file_path: filepath,
        url: signedUrl.signedUrl,
        duration_seconds: formData.duration_seconds
      });

    if (dbError) {
      showError(`Failed to save song: ${dbError.message}`);
      // TODO: Delete file from storage since DB record failed
      return;
    }

    showSuccess('✅ Song uploaded successfully');
    setFormData({ title: '', artist: '', filename: '', duration_seconds: 0 });
    fileInputRef.current.value = ''; // Reset file input
    onSongAdded?.(); // Refresh song list

  } finally {
    setIsUploading(false);
  }
};
```

---

## 3. Workflow: Add Streaming URL

### Step-by-Step Process

**Step 1: User Opens "Add URL" Section**
1. User clicks "[+] Add URL" to expand section

**Step 2: Enter Metadata**
1. User enters:
   - Title (required) - Song name
   - Artist (optional) - Artist name
   - URL (required) - HTTPS link to audio file
2. Validate URL format (must start with https://)

**Step 3: Add Song**
1. User clicks "Add" button
2. Frontend:
   - Validates URL is valid HTTPS
   - Creates `songs` record with:
     - `source_type` = 'url'
     - `url` = the URL pasted
     - `file_path` = NULL (not a local file)
     - `title`, `artist` from form
     - `duration_seconds` = NULL (can calculate on playback if available)
   - Shows success message: "✅ Song added successfully"
3. Modal closes
4. New song appears in song library

### Implementation

```typescript
const handleAddUrl = async () => {
  // Validate
  if (!formData.title.trim()) {
    showError('Title is required');
    return;
  }

  if (!formData.url.trim()) {
    showError('URL is required');
    return;
  }

  if (!formData.url.startsWith('https://')) {
    showError('URL must be HTTPS (https://)');
    return;
  }

  try {
    const { error } = await supabase
      .from('songs')
      .insert({
        user_id: currentUser.id,
        title: formData.title,
        artist: formData.artist || null,
        source_type: 'url',
        file_path: null,
        url: formData.url,
        duration_seconds: null // Will be calculated on playback if available
      });

    if (error) {
      showError(`Failed to add song: ${error.message}`);
      return;
    }

    showSuccess('✅ Song added successfully');
    setFormData({ title: '', artist: '', url: '' });
    onSongAdded?.();

  } catch (error) {
    showError('An error occurred');
  }
};
```

---

## 4. Song Library Management

### View All Songs

**Location:** Songs menu in sidebar
**Shows:** All songs in user's library (both local files and URLs)

**Features:**
- List all songs
- Show title, artist, duration, source type
- Click song to play
- Click [Edit] to modify metadata
- Click [Delete] to remove from library

---

### Edit Song Metadata

**Step-by-Step:**
1. User clicks [Edit] on a song card
2. Modal appears with editable fields:
   - Title (required)
   - Artist (optional)
   - Duration (optional, read-only for local files)
   - Source type (read-only: 'local_file' or 'url')
3. User modifies metadata
4. User clicks "Save"
5. System updates `songs` record
6. Modal closes

**Implementation:**
```typescript
const handleEditSong = async () => {
  if (!currentSong.title.trim()) {
    showError('Title is required');
    return;
  }

  try {
    const { error } = await supabase
      .from('songs')
      .update({
        title: currentSong.title,
        artist: currentSong.artist || null,
        // duration_seconds and other fields are read-only
      })
      .eq('id', currentSong.id);

    if (error) {
      showError(`Failed to update song: ${error.message}`);
      return;
    }

    showSuccess('✅ Song updated');
    onSongUpdated?.();

  } catch (error) {
    showError('An error occurred');
  }
};
```

---

### Delete Song from Library

**Step-by-Step:**
1. User clicks [Delete] on a song card
2. Confirmation dialog: "Delete this song? (It will be removed from all playlists)"
3. User confirms
4. System:
   - Deletes `songs` record (cascades to delete from all `playlist_songs`)
   - If local file, deletes from Supabase Storage (optional, can leave orphaned)
   - Deletes all `playback_positions` for this song

**Implications:**
- Song is removes from all playlists immediately
- Local file is gone from Supabase Storage
- No recovery (permanent deletion)

**Implementation:**
```typescript
const handleDeleteSong = async (songId: string, filePath?: string) => {
  if (!confirm('Delete this song? It will be removed from all playlists.')) {
    return;
  }

  try {
    // Delete file from Supabase Storage if local
    if (filePath) {
      await supabase.storage.from('songs').remove([filePath]);
    }

    // Delete database record (cascades to playlist_songs, playback_positions)
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId);

    if (error) {
      showError(`Failed to delete song: ${error.message}`);
      return;
    }

    showSuccess('✅ Song deleted');
    onSongDeleted?.();

  } catch (error) {
    showError('An error occurred');
  }
};
```

---

## 5. Data Model References

**`songs` Table Columns:**
- `id` (UUID) - Unique song ID
- `user_id` (UUID) - Owner
- `title` (text, required) - Song name
- `artist` (text, optional) - Artist name
- `source_type` (enum) - 'local_file' or 'url'
- `file_path` (text, nullable) - Path in storage (NULL for URLs)
- `url` (text, required) - Playback URL
- `duration_seconds` (integer, optional) - Song length in seconds

See `DSGN_002_database_schema.md` for complete schema.

---

## 6. Error Handling

| Error | Message | Action |
|-------|---------|--------|
| File too large | "File exceeds 100 MB limit" | Clear form, prompt to use URL instead |
| Invalid file type | "Only audio files accepted (.mp3, .wav, etc.)" | Show file picker again |
| Upload failed | "Upload failed: [error details]" | Retry button or cancel |
| Network error | "Network error during upload" | Auto-retry every 5 seconds |
| Storage quota exceeded | "Storage full, delete some songs first" | Show space status |
| Title required | "Please enter a song title" | Refocus title input |
| Invalid URL | "URL must be valid HTTPS link" | Clear URL field |
| Duplicate song | "Song already in library" (optional) | Skip or merge |

---

## 7. Storage & Cleanup

### File Organization
- **Path Pattern:** `users/{user_id}/songs/{uuid}-{filename}`
- **Example:** `users/f47ac10b-58cc-4372-a567-0e02b2c3d479/songs/a1b2c3d4-e5f6-Beautiful_Day.mp3`

### Signed URLs
- **Duration:** 1 year (can be extended if needed)
- **Security:** Only accessible with signed URL, no public URLs
- **Refresh:** Can generate new signed URL if old one expires

### Cleanup Policies (Future)
- Delete orphaned files (file_path not found in songs table)
- Cleanup deleted user files (on cascade delete)
- Archive old unpaid accounts (future, if implementing paid tier)

---

## 8. Performance Considerations

- **File Upload:** Use resumable upload for files > 10MB (future)
- **Metadata Extraction:** Do on frontend (don't upload, parse, then delete)
- **Duration Calculation:** Cache duration in database for faster queries
- **Storage Index:** Index on `user_id` for fast filtering
- **Signed URLs:** Cache/refresh every 30 days if long-term

---

## 9. CORS & Security

### CORS (Cross-Origin Resource Sharing)
- Supabase Storage handles CORS automatically
- External HTTPS URLs must support CORS headers (or use CORS proxy)
- Audio element uses `crossOrigin="anonymous"` for CORS requests

**Implementation:**
```html
<audio
  ref={audioRef}
  crossOrigin="anonymous"
  onPlay={handlePlay}
  onPause={handlePause}
  onEnded={handleEnd}
  onError={handleError}
  onTimeUpdate={handleTimeUpdate}
  onLoadedMetadata={handleLoadedMetadata}
/>
```

### File Type Validation
- Frontend validates file type (MIME type)
- Backend RLS enforces user ownership
- File paths include user ID (user can't access others' files)

---

## 10. Testing Checklist

- [ ] Upload local .mp3 file
- [ ] Upload local .wav file
- [ ] Upload local .ogg file
- [ ] File picker filters to audio types
- [ ] Filename auto-fills title field
- [ ] Duration calculated correctly
- [ ] Manual edit of title/artist works
- [ ] Upload shows progress
- [ ] Song appears in library after upload
- [ ] Add song via HTTPS URL
- [ ] URL format validation (must be https://)
- [ ] Title required validation
- [ ] Song appears in library after adding URL
- [ ] Edit song metadata
- [ ] Delete song from library
- [ ] Delete song cascades to playlists
- [ ] File size validation (reject > 100MB)
- [ ] Network error during upload (retry)
- [ ] Play uploaded song successfully
- [ ] Play URL-based song successfully

---

**Cross-References:**
- `DSGN_002_database_schema.md` - songs table
- `DSGN_003_ui_design.md` - Add Song modal UI
- `FEAT_002_music_playback.md` - Playing songs

**Last Updated:** 2026-03-24
**Status:** Approved
