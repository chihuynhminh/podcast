/**
 * SongsView Component
 * Displays user's song library and provides CRUD operations
 */

import { useState, useEffect } from 'react';
import { Song } from '../types';
import { songService } from '../services/songService';
import { AddSongModal } from './AddSongModal';
import { EditSongModal } from './EditSongModal';
import { DeleteSongModal } from './DeleteSongModal';

interface SongsViewProps {
  userId: string;
  onSongSelect?: (song: Song) => void;
}

type ModalType = 'add' | 'edit' | 'delete' | null;

export function SongsView({ userId, onSongSelect }: SongsViewProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // Load songs on mount and when refreshKey changes
  useEffect(() => {
    loadSongs();
  }, [userId, refreshKey]);

  const loadSongs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await songService.getSongs(userId);
      setSongs(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load songs';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalType('add');
  };

  const handleOpenEditModal = (song: Song) => {
    setSelectedSong(song);
    setModalType('edit');
  };

  const handleOpenDeleteModal = (song: Song) => {
    setSelectedSong(song);
    setModalType('delete');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedSong(null);
  };

  const handleSongCreated = (newSong: Song) => {
    setSongs([newSong, ...songs]);
    handleCloseModal();
  };

  const handleSongUpdated = (updatedSong: Song) => {
    setSongs(
      songs.map((s) => (s.id === updatedSong.id ? updatedSong : s))
    );
    handleCloseModal();
  };

  const handleSongDeleted = () => {
    if (selectedSong) {
      setSongs(songs.filter((s) => s.id !== selectedSong.id));
    }
    handleCloseModal();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSourceTypeBadge = (sourceType: 'local_file' | 'url') => {
    return sourceType === 'local_file' ? '💾 Local' : '🔗 URL';
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Song Library</h2>
        <p style={styles.loadingText}>Loading songs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Song Library</h2>
        <div style={styles.errorBox}>
          ✗ {error}
          <button
            style={styles.retryButton}
            onClick={() => setRefreshKey(refreshKey + 1)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h2 style={styles.title}>Song Library</h2>
        </div>
        <div style={styles.emptyState}>
          <p style={styles.emptyStateTitle}>No songs yet</p>
          <p style={styles.emptyStateText}>
            Click 'Add Song' to get started with your music library.
          </p>
          <button
            style={styles.primaryButton}
            onClick={handleOpenAddModal}
          >
            + Add Song
          </button>
        </div>

        {modalType === 'add' && (
          <AddSongModal
            userId={userId}
            onClose={handleCloseModal}
            onSongCreated={handleSongCreated}
          />
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Song Library</h2>
        <button
          style={styles.addButton}
          onClick={handleOpenAddModal}
          aria-label="Add new song"
        >
          + Add Song
        </button>
      </div>

      <div style={styles.songGrid}>
        {songs.map((song) => (
          <div
            key={song.id}
            style={styles.songCard}
            onClick={() => onSongSelect?.(song)}
          >
            <h3 style={styles.songTitle}>{song.title}</h3>
            {song.artist && (
              <p style={styles.songArtist}>{song.artist}</p>
            )}
            <div style={styles.songMeta}>
              <span style={styles.sourceTypeBadge}>
                {getSourceTypeBadge(song.source_type)}
              </span>
              <span style={styles.duration}>
                {formatDuration(song.duration_seconds)}
              </span>
            </div>
            <div style={styles.songActions}>
              <button
                style={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditModal(song);
                }}
              >
                Edit
              </button>
              <button
                style={{ ...styles.actionButton, ...styles.deleteButton }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDeleteModal(song);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalType === 'add' && (
        <AddSongModal
          userId={userId}
          onClose={handleCloseModal}
          onSongCreated={handleSongCreated}
        />
      )}

      {modalType === 'edit' && selectedSong && (
        <EditSongModal
          song={selectedSong}
          onClose={handleCloseModal}
          onSongUpdated={handleSongUpdated}
        />
      )}

      {modalType === 'delete' && selectedSong && (
        <DeleteSongModal
          song={selectedSong}
          onClose={handleCloseModal}
          onSongDeleted={handleSongDeleted}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem',
    flex: 1,
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#191414',
    margin: 0,
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1DB954',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    fontFamily: 'inherit',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 2rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
  emptyStateTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#191414',
    margin: '0 0 0.5rem 0',
  },
  emptyStateText: {
    color: '#666',
    marginBottom: '1.5rem',
  },
  primaryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1DB954',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    fontFamily: 'inherit',
  },
  songGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  songCard: {
    backgroundColor: 'white',
    border: '1px solid #E0E0E0',
    borderRadius: '8px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  },
  songTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#191414',
    margin: '0 0 0.3rem 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  songArtist: {
    fontSize: '0.9rem',
    color: '#666',
    margin: '0 0 1rem 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  songMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #E0E0E0',
  },
  sourceTypeBadge: {
    backgroundColor: '#f0f0f0',
    padding: '0.3rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  duration: {
    color: '#999',
    fontWeight: 'bold',
  },
  songActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionButton: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #E0E0E0',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    fontWeight: 500,
  },
  deleteButton: {
    color: '#d32f2f',
    borderColor: '#d32f2f',
  },
  loadingText: {
    color: '#666',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    padding: '1rem',
    borderRadius: '4px',
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
  },
};
