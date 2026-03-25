/**
 * MusicPlayer Component
 * Basic music player with controls for play/pause, skip, volume, repeat, shuffle
 */

import { useState } from 'react';
import { Song } from '../types';

interface MusicPlayerProps {
  currentSong?: Song | null;
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeek?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  onRepeatChange?: () => void;
  onShuffleChange?: () => void;
}

export function MusicPlayer({
  currentSong,
  isPlaying = false,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onRepeatChange,
  onShuffleChange,
}: MusicPlayerProps) {
  const [volume, setVolume] = useState(70);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [isShuffle, setIsShuffle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  const handleRepeatChange = () => {
    const modes: Array<'none' | 'all' | 'one'> = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    onRepeatChange?.();
  };

  const handleShuffleChange = () => {
    setIsShuffle(!isShuffle);
    onShuffleChange?.();
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRepeatIcon = (): string => {
    if (repeatMode === 'all') return '↻ All';
    if (repeatMode === 'one') return '↻ 1';
    return '↻';
  };

  return (
    <div style={styles.player}>
      {/* Song Info Section */}
      <div style={styles.songInfo}>
        {currentSong ? (
          <>
            <div style={styles.songTitle}>{currentSong.title}</div>
            <div style={styles.songArtist}>
              {currentSong.artist || 'Unknown Artist'}
            </div>
          </>
        ) : (
          <div style={styles.noSongText}>No song playing</div>
        )}
      </div>

      {/* Controls Section */}
      <div style={styles.controls}>
        {/* Previous Button */}
        <button
          style={styles.controlButton}
          onClick={onPrevious}
          disabled={!currentSong}
          aria-label="Previous song"
        >
          ◀
        </button>

        {/* Play/Pause Button */}
        <button
          style={{ ...styles.controlButton, ...styles.playButton }}
          onClick={handlePlayToggle}
          disabled={!currentSong}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Next Button */}
        <button
          style={styles.controlButton}
          onClick={onNext}
          disabled={!currentSong}
          aria-label="Next song"
        >
          ▶
        </button>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <span style={styles.timeText}>{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={currentSong ? (currentTime / 180) * 100 : 0}
          onChange={(e) => {
            const newTime = (parseInt(e.target.value) / 100) * 180;
            setCurrentTime(newTime);
            onSeek?.(newTime);
          }}
          style={styles.progressBar}
          disabled={!currentSong}
          aria-label="Progress"
        />
        <span style={styles.timeText}>3:00</span>
      </div>

      {/* Volume Control */}
      <div style={styles.volumeContainer}>
        <span style={styles.volumeIcon}>🔊</span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
          style={styles.volumeSlider}
          aria-label="Volume"
        />
      </div>

      {/* Mode Controls */}
      <div style={styles.modeControls}>
        <button
          style={{
            ...styles.modeButton,
            ...(repeatMode !== 'none' ? styles.modeButtonActive : {}),
          }}
          onClick={handleRepeatChange}
          aria-label={`Repeat: ${repeatMode}`}
        >
          {getRepeatIcon()}
        </button>
        <button
          style={{
            ...styles.modeButton,
            ...(isShuffle ? styles.modeButtonActive : {}),
          }}
          onClick={handleShuffleChange}
          aria-label={`Shuffle: ${isShuffle ? 'on' : 'off'}`}
        >
          🔀
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  player: {
    height: '80px',
    backgroundColor: '#191414',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    padding: '0 1rem',
    gap: '1rem',
    boxSizing: 'border-box',
    borderTop: '1px solid #E0E0E0',
    flexShrink: 0,
  },
  songInfo: {
    minWidth: '180px',
  },
  songTitle: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
    color: 'white',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  songArtist: {
    fontSize: '0.8rem',
    color: '#999',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  noSongText: {
    fontSize: '0.9rem',
    color: '#999',
  },
  controls: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'transparent',
    border: '1px solid white',
    color: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    transition: 'background-color 0.2s ease',
  },
  playButton: {
    backgroundColor: '#1DB954',
    border: 'none',
    width: '48px',
    height: '48px',
    fontSize: '1.2rem',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
    minWidth: '200px',
  },
  timeText: {
    fontSize: '0.8rem',
    color: '#999',
    minWidth: '35px',
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: '4px',
    cursor: 'pointer',
    accentColor: '#1DB954',
  },
  volumeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: '120px',
  },
  volumeIcon: {
    fontSize: '1rem',
  },
  volumeSlider: {
    flex: 1,
    height: '4px',
    cursor: 'pointer',
    accentColor: '#1DB954',
  },
  modeControls: {
    display: 'flex',
    gap: '0.5rem',
  },
  modeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#999',
    padding: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    borderRadius: '4px',
    transition: 'color 0.2s ease, background-color 0.2s ease',
  },
  modeButtonActive: {
    color: '#1DB954',
    backgroundColor: 'rgba(29, 185, 84, 0.2)',
  },
};
