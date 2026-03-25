# FEAT_002: Music Playback & Player Controls

**Document Type:** Feature
**Status:** Active
**Created:** 2026-03-24

---

## 1. Feature Overview

Users can play music from playlists with full playback controls. The player supports play/pause, volume, progress seeking, repeat modes, shuffle, and auto-saves playback position for resume functionality.

---

## 2. Core Playback Controls

### Control 1: Play/Pause Button

**Behavior:**
- **When Paused:** Show play icon (▶), clicking calls `play()`
- **When Playing:** Show pause icon (⏸), clicking calls `pause()`
- **Before Song Selected:** Button is disabled (grayed out)
- **Feedback:** Visual change is instant, no spinner

**HTML5 Audio Implementation:**
```typescript
const audioRef = useRef<HTMLAudioElement>(null);

const handlePlay = () => {
  if (audioRef.current) {
    audioRef.current.play().catch(err => {
      // Handle play error (e.g., network, permissions)
      console.error('Play error:', err);
      skipToNextSong(); // Auto-skip on error
    });
  }
};

const handlePause = () => {
  if (audioRef.current) {
    audioRef.current.pause();
  }
};
```

---

### Control 2: Previous/Next Navigation

**Behavior:**
- **[< Previous] Button:**
  - Skips to previous song in playlist
  - If at song #1, wraps to last song (optional, or can disable)
  - Restarts from saved position if returning to previous song
  - If shuffle is on, goes to previous song in shuffled order

- **[Next >] Button:**
  - Skips to next song in playlist
  - If at last song, behavior depends on repeat mode:
    - **No Repeat:** Play stops and stops at end
    - **Repeat All:** Wraps to first song
    - **Repeat One:** Restarts current song
  - Restarts from saved position if next song was played before
  - If shuffle is on, goes to next song in shuffled order

**Implementation:**
```typescript
const handleNext = () => {
  const nextIndex = currentPlaylistIndex + 1;
  if (nextIndex >= filteredSongs.length) {
    if (repeatMode === 'all') {
      setCurrentPlaylistIndex(0);
    } else if (repeatMode === 'one') {
      restartCurrentSong();
    } else {
      pause();
    }
  } else {
    playSong(filteredSongs[nextIndex]);
    setCurrentPlaylistIndex(nextIndex);
  }
};

const handlePrevious = () => {
  if (currentTime > 3) {
    // If >3 seconds into song, restart this song
    restartCurrentSong();
  } else if (currentPlaylistIndex > 0) {
    playSong(filteredSongs[currentPlaylistIndex - 1]);
    setCurrentPlaylistIndex(currentPlaylistIndex - 1);
  } else {
    // At first song, wrap to last
    playSong(filteredSongs[filteredSongs.length - 1]);
    setCurrentPlaylistIndex(filteredSongs.length - 1);
  }
};
```

---

### Control 3: Progress Bar & Seeking

**Visual:**
- Horizontal bar showing current position
- Circle/dot at current time
- Clickable to seek to any position
- Shows current time (left) and total duration (right)
- Format: "MM:SS / MM:SS" (e.g., "02:45 / 04:30")

**Behavior:**
- Click anywhere on bar to seek to that position
- Drag circle to seek (optional, for desktop)
- Update position every 100ms while playing
- Format duration on page load (get from metadata)
- Show "0:00 / 0:00" while loading

**Implementation:**
```typescript
const handleProgressClick = (e: React.MouseEvent) => {
  if (!audioRef.current || !duration) return;

  const bar = e.currentTarget;
  const rect = bar.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const newTime = percent * duration;

  audioRef.current.currentTime = newTime;
  setCurrentTime(newTime);
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

---

### Control 4: Volume Control

**Visual:**
- Volume icon (🔊)
- Horizontal slider (0-100%)
- Click slider to change volume
- Show current volume percentage

**Behavior:**
- Default volume: 100% (1.0)
- Range: 0% (mute) to 100% (full)
- Smooth adjustments (no jumpy changes)
- Persist volume to localStorage (remembers user preference)
- Mute button (optional): Click icon to toggle mute

**Implementation:**
```typescript
const [volume, setVolume] = useState(
  parseFloat(localStorage.getItem('playerVolume') ?? '1')
);

const handleVolumeChange = (newVolume: number) => {
  setVolume(newVolume);
  if (audioRef.current) {
    audioRef.current.volume = newVolume;
  }
  localStorage.setItem('playerVolume', newVolume.toString());
};
```

---

### Control 5: Repeat Mode

**Three States:**
1. **No Repeat (↻)** - Play through entire playlist, stop at end
2. **Repeat All (↻)** - Restart playlist when reaching end
3. **Repeat One (↻ 1)** - Loop current song indefinitely

**Behavior:**
- Click button to cycle: No Repeat → All → One → No Repeat
- Visual indicator shows current state (highlight/badge)
- At end of playlist:
  - If "All": auto-play first song
  - If "One": auto-restart current song
  - If "No": playback stops
- Persist mode to localStorage

**Implementation:**
```typescript
const repeatModes = ['none', 'all', 'one'] as const;
const [repeatMode, setRepeatMode] = useState(
  (localStorage.getItem('repeatMode') as typeof repeatModes[number]) ?? 'none'
);

const handleRepeatToggle = () => {
  const index = repeatModes.indexOf(repeatMode);
  const nextMode = repeatModes[(index + 1) % repeatModes.length];
  setRepeatMode(nextMode);
  localStorage.setItem('repeatMode', nextMode);
};

const onAudioEnded = () => {
  if (repeatMode === 'one') {
    audioRef.current?.play();
  } else if (repeatMode === 'all') {
    handleNext();
  }
  // else: stop (no repeat)
};
```

---

### Control 6: Shuffle

**Two States:**
1. **Shuffle Off (default):** Play songs in playlist order
2. **Shuffle On:** Play songs in randomized order

**Behavior:**
- Click button to toggle shuffle on/off
- When enabled:
  - Generate random order of playlist songs (don't modify database)
  - Previous/Next navigate shuffled order
  - Shows visual indicator (highlight/badge)
- When disabled:
  - Return to original playlist order
  - Previous/Next navigate original order
- Does NOT persist across sessions (reset on reload)

**Implementation:**
```typescript
const [isShuffle, setIsShuffle] = useState(false);
const [shuffledOrder, setShuffledOrder] = useState<Song[]>([]);

const handleShuffleToggle = () => {
  if (!isShuffle) {
    // Enable shuffle: generate random order
    const newOrder = [...currentPlaylist].sort(() => Math.random() - 0.5);
    setShuffledOrder(newOrder);
    setIsShuffle(true);
  } else {
    // Disable shuffle: back to original order
    setIsShuffle(false);
    setShuffledOrder([]);
  }
};

// Use shuffled or original list based on toggle
const activePlaylist = isShuffle ? shuffledOrder : currentPlaylist;
```

---

## 3. Playback Position Tracking & Resume

### Auto-Save Mechanism

**Frequency:** Every 5-10 seconds while playing + on pause/stop

**Implementation:**
```typescript
useEffect(() => {
  if (!isPlaying || !currentSong) return;

  // Auto-save every 7 seconds
  const interval = setInterval(() => {
    savePlaybackPosition(currentSong.id, currentPlaylistId, currentTime);
  }, 7000);

  return () => clearInterval(interval);
}, [isPlaying, currentSong, currentTime, currentPlaylistId]);

const savePlaybackPosition = async (songId: string, playlistId: string, position: number) => {
  try {
    await supabase
      .from('playback_positions')
      .upsert({
        user_id: currentUser.id,
        song_id: songId,
        playlist_id: playlistId,
        current_time_seconds: position,
        updated_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to save position:', error);
    // Silently fail, retry next time
  }
};

// On audio pause/stop
const handleAudioPause = () => {
  setIsPlaying(false);
  // Immediately save position (don't wait for interval)
  if (currentSong && currentPlaylistId) {
    savePlaybackPosition(currentSong.id, currentPlaylistId, currentTime);
  }
};

// On page unload
window.addEventListener('beforeunload', () => {
  if (isPlaying && currentSong && currentPlaylistId) {
    savePlaybackPosition(currentSong.id, currentPlaylistId, currentTime);
  }
});
```

### Loading Saved Position

**When Playing a Song:**
1. Fetch `playback_positions` record for (user_id, song_id, playlist_id)
2. If record exists, use `current_time_seconds`
3. If no record, start from 0
4. Set `audioRef.current.currentTime = position`

**Implementation:**
```typescript
const playSong = async (song: Song) => {
  setCurrentSong(song);

  // Fetch saved position
  const { data: positions } = await supabase
    .from('playback_positions')
    .select('current_time_seconds')
    .eq('user_id', currentUser.id)
    .eq('song_id', song.id)
    .eq('playlist_id', currentPlaylistId)
    .single();

  const startPosition = positions?.current_time_seconds ?? 0;

  // Set audio URL and start position
  if (audioRef.current) {
    audioRef.current.src = song.url;
    audioRef.current.currentTime = startPosition;
    await audioRef.current.play();
    setIsPlaying(true);
  }
};
```

---

## 4. Error Handling for Playback

### Error Scenarios

| Scenario | Cause | Behavior |
|----------|-------|----------|
| URL unavailable | File deleted/removed | Auto-skip to next song, show toast: "Song unavailable, skipping..." |
| Network lost | Connectivity issue | Pause, show "Network error" message, auto-retry on reconnect |
| CORS issue | Cross-site origin blocking | Auto-skip, show "Can't play this song" |
| Unsupported format | Browser doesn't support codec | Auto-skip, show "Format not supported" |
| File too large | Timeout after 30 seconds | Auto-skip, show "Song took too long to load" |

### Implementation

```typescript
const handlePlayError = (e: Event) => {
  const errorCode = audioRef.current?.error?.code;
  console.error('Playback error:', errorCode);

  // Auto-skip to next song
  skipToNextSong();

  // Show notification
  showNotification(`Can't play this song, skipping...`, 'error');
};

const handleCanPlay = () => {
  // Song loaded successfully, safe to play
  setIsLoading(false);
};

// Attach listeners
useEffect(() => {
  if (!audioRef.current) return;

  audioRef.current.addEventListener('error', handlePlayError);
  audioRef.current.addEventListener('canplay', handleCanPlay);

  return () => {
    audioRef.current?.removeEventListener('error', handlePlayError);
    audioRef.current?.removeEventListener('canplay', handleCanPlay);
  };
}, []);
```

---

## 5. Song Selection & Playing

### How a Song is Selected for Playback

**Option 1: From Playlist View**
1. User clicks a song in `<PlaylistDetail />`
2. `<MusicPlayer>` sets as `currentSong`
3. Fetches saved position, starts playback

**Option 2: From Song Library**
1. User clicks a song in `<SongsView />`
2. Creates a temporary "Now Playing" playlist (songs table query)
3. Sets song as current and starts playback

**Option 3: Auto-play Next**
1. Previous song ends
2. Based on repeat/shuffle, auto-plays next song
3. Fetches position, starts playback

---

## 6. Song Information Display

**In Player:**
- Current song title (bold)
- Artist name
- Current playlist name (small text)
- Album art (optional, if available)

**In Playlist:**
- Title
- Artist
- Duration
- Position number

---

## 7. Loading & Buffering States

**Before Play:**
```
Loading... ⟳
```

**While Buffering:**
```
Song title... (spinner)
```

**Ready to Play:**
```
[▶] Beautiful Day - The Band
━━━━━●─────────────
```

---

## 8. UI State Management

**Player State:**
```typescript
const [currentSong, setCurrentSong] = useState<Song | null>(null);
const [isPlaying, setIsPlaying] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);
const [volume, setVolume] = useState(1);
const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
const [isShuffle, setIsShuffle] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);
const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
```

---

## 9. Testing Checklist

- [ ] Play button works (starts playback)
- [ ] Pause button works (stops playback)
- [ ] Previous button skips to previous song
- [ ] Next button skips to next song
- [ ] Progress bar click seeks to position
- [ ] Typing in progress bar seeks correctly
- [ ] Duration displays correctly
- [ ] Volume slider works (0-100%)
- [ ] Repeat mode cycles (none → all → one → none)
- [ ] Shuffle randomizes song order
- [ ] Disable shuffle returns to original order
- [ ] Playback position saves every 7 seconds
- [ ] Playback position saves on pause
- [ ] Playback resumes from saved position on reload
- [ ] Unavailable song auto-skips
- [ ] Error messages display for failures
- [ ] Song changes automatically at end (repeat all)
- [ ] Song restarts at end (repeat one)

---

**Cross-References:**
- `DSGN_003_ui_design.md` - Player UI layout
- `DSGN_002_database_schema.md` - playback_positions table
- `FEAT_001_playlist_management.md` - Playlist navigation

**Last Updated:** 2026-03-24
**Status:** Approved
