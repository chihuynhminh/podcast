/**
 * EditSongModal Component
 * Modal dialog for editing an existing song
 */

import { useState, useEffect } from 'react';
import { Song } from '../types';
import { songService } from '../services/songService';

interface EditSongModalProps {
  song: Song;
  onClose: () => void;
  onSongUpdated: (song: Song) => void;
}

export function EditSongModal({
  song,
  onClose,
  onSongUpdated,
}: EditSongModalProps) {
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(song.title);
    setArtist(song.artist || '');
  }, [song]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSourceTypeBadge = (sourceType: 'local_file' | 'url') => {
    return sourceType === 'local_file' ? '💾 Local File' : '🔗 URL';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Song title is required');
      return;
    }

    if (title.length > 255) {
      setError('Song title must be 255 characters or less');
      return;
    }

    if (artist.length > 255) {
      setError('Artist name must be 255 characters or less');
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedSong = await songService.updateSong(
        song.id,
        title.trim(),
        artist.trim() || undefined,
        song.duration_seconds
      );
      onSongUpdated(updatedSong);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update song';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Edit Song</h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="song-title" style={styles.label}>
              Song Title *
            </label>
            <input
              id="song-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song title"
              disabled={isSubmitting}
              style={styles.input}
              maxLength={255}
              required
            />
            <span style={styles.charCount}>{title.length}/255</span>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="song-artist" style={styles.label}>
              Artist (optional)
            </label>
            <input
              id="song-artist"
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist name"
              disabled={isSubmitting}
              style={styles.input}
              maxLength={255}
            />
            <span style={styles.charCount}>{artist.length}/255</span>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Source Type</span>
              <div style={styles.readOnlyBadge}>
                {getSourceTypeBadge(song.source_type)}
              </div>
            </div>

            {song.duration_seconds && (
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Duration</span>
                <div style={styles.readOnlyValue}>
                  {formatDuration(song.duration_seconds)}
                </div>
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              {song.source_type === 'url' ? 'URL' : 'File Path'}
            </label>
            <div style={styles.readOnlyField}>
              {song.source_type === 'url' ? song.url : song.file_path}
            </div>
          </div>

          {error && <div style={styles.error}>✗ {error}</div>}

          <div style={styles.buttonGroup}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...styles.submitButton,
                opacity: isSubmitting ? 0.6 : 1,
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#191414',
    margin: 0,
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#999',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: '0.95rem',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  charCount: {
    fontSize: '0.75rem',
    color: '#999',
    textAlign: 'right',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  infoLabel: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: '#666',
  },
  readOnlyBadge: {
    backgroundColor: '#f0f0f0',
    padding: '0.5rem 0.8rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
    color: '#333',
    fontWeight: '500',
  },
  readOnlyValue: {
    fontSize: '0.9rem',
    color: '#333',
    fontWeight: '500',
  },
  readOnlyField: {
    padding: '0.75rem',
    backgroundColor: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '0.9rem',
    color: '#666',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    padding: '0.75rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontFamily: 'inherit',
    fontWeight: 'bold',
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1DB954',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontFamily: 'inherit',
    fontWeight: 'bold',
  },
};
