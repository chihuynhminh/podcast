/**
 * EditPlaylistModal Component
 * Modal dialog for editing an existing playlist
 */

import { useState, useEffect } from 'react';
import { Playlist } from '../types';
import { playlistService } from '../services/playlistService';

interface EditPlaylistModalProps {
  playlist: Playlist;
  onClose: () => void;
  onPlaylistUpdated: (playlist: Playlist) => void;
}

export function EditPlaylistModal({
  playlist,
  onClose,
  onPlaylistUpdated,
}: EditPlaylistModalProps) {
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(playlist.name);
    setDescription(playlist.description || '');
  }, [playlist]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Playlist name is required');
      return;
    }

    if (name.length > 255) {
      setError('Playlist name must be 255 characters or less');
      return;
    }

    if (description.length > 500) {
      setError('Description must be 500 characters or less');
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedPlaylist = await playlistService.updatePlaylist(
        playlist.id,
        name.trim(),
        description.trim() || undefined
      );
      onPlaylistUpdated(updatedPlaylist);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update playlist';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Edit Playlist</h2>
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
            <label htmlFor="playlist-name" style={styles.label}>
              Playlist Name *
            </label>
            <input
              id="playlist-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Playlist"
              disabled={isSubmitting}
              style={styles.input}
              maxLength={255}
              required
            />
            <span style={styles.charCount}>{name.length}/255</span>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="playlist-description" style={styles.label}>
              Description (optional)
            </label>
            <textarea
              id="playlist-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              disabled={isSubmitting}
              style={styles.textarea}
              maxLength={500}
              rows={3}
            />
            <span style={styles.charCount}>{description.length}/500</span>
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
  textarea: {
    padding: '0.75rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  charCount: {
    fontSize: '0.75rem',
    color: '#999',
    textAlign: 'right',
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
