/**
 * DeleteSongModal Component
 * Confirmation dialog for deleting a song
 */

import { useState } from 'react';
import { Song } from '../types';
import { songService } from '../services/songService';

interface DeleteSongModalProps {
  song: Song;
  onClose: () => void;
  onSongDeleted: () => void;
}

export function DeleteSongModal({
  song,
  onClose,
  onSongDeleted,
}: DeleteSongModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);

    try {
      setIsSubmitting(true);
      await songService.deleteSong(song.id);
      onSongDeleted();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete song';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Delete Song?</h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div style={styles.modalBody}>
          <p style={styles.confirmText}>
            Are you sure you want to delete <strong>{song.title}</strong>?
          </p>
          <p style={styles.warningText}>
            This action cannot be undone. The song will be removed from your
            library and all playlists.
          </p>

          {error && <div style={styles.error}>✗ {error}</div>}
        </div>

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
            type="button"
            style={{
              ...styles.deleteButton,
              opacity: isSubmitting ? 0.6 : 1,
            }}
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
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
    maxWidth: '400px',
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
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#d32f2f',
    margin: 0,
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#999',
  },
  modalBody: {
    marginBottom: '1.5rem',
  },
  confirmText: {
    fontSize: '1rem',
    color: '#333',
    margin: '0 0 1rem 0',
  },
  warningText: {
    fontSize: '0.9rem',
    color: '#666',
    margin: 0,
    fontStyle: 'italic',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    padding: '0.75rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
    marginTop: '1rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
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
  deleteButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontFamily: 'inherit',
    fontWeight: 'bold',
  },
};
