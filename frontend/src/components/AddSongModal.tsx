/**
 * AddSongModal Component
 * Modal dialog for adding a new song to the library
 */

import { useState } from 'react';
import { Song } from '../types';
import { songService } from '../services/songService';

interface AddSongModalProps {
  userId: string;
  onClose: () => void;
  onSongCreated: (song: Song) => void;
}

export function AddSongModal({
  userId,
  onClose,
  onSongCreated,
}: AddSongModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateHttpsUrl = (urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
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

    if (!url.trim()) {
      setError('Song URL is required');
      return;
    }

    if (!validateHttpsUrl(url.trim())) {
      setError('URL must be a valid HTTPS URL (https://)');
      return;
    }

    try {
      setIsSubmitting(true);
      const newSong = await songService.createSong(
        userId,
        title.trim(),
        artist.trim() || undefined,
        'url',
        url.trim()
      );
      onSongCreated(newSong);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create song';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Add New Song</h2>
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
              placeholder="Enter song title"
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
              placeholder="Enter artist name"
              disabled={isSubmitting}
              style={styles.input}
              maxLength={255}
            />
            <span style={styles.charCount}>{artist.length}/255</span>
          </div>

          <div style={styles.formGroup}>
            <div style={styles.badgeRow}>
              <label style={styles.label}>Source Type</label>
              <span style={styles.sourceBadge}>🔗 URL</span>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="song-url" style={styles.label}>
              Song URL *
            </label>
            <input
              id="song-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/song.mp3"
              disabled={isSubmitting}
              style={styles.input}
              required
            />
            <span style={styles.helpText}>Must be an HTTPS URL</span>
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
              {isSubmitting ? 'Adding...' : 'Add Song'}
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
  badgeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: '0.95rem',
  },
  sourceBadge: {
    backgroundColor: '#f0f0f0',
    padding: '0.3rem 0.8rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#666',
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
  helpText: {
    fontSize: '0.75rem',
    color: '#999',
    fontStyle: 'italic',
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
