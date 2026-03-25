/**
 * PlaylistsView Component
 * Displays user's playlists and provides CRUD operations
 */

import { useState, useEffect } from 'react';
import { Playlist } from '../types';
import { playlistService } from '../services/playlistService';
import { AddPlaylistModal } from './AddPlaylistModal';
import { EditPlaylistModal } from './EditPlaylistModal';
import { DeletePlaylistModal } from './DeletePlaylistModal';

interface PlaylistsViewProps {
  userId: string;
  onPlaylistSelect?: (playlist: Playlist) => void;
}

type ModalType = 'add' | 'edit' | 'delete' | null;

export function PlaylistsView({ userId, onPlaylistSelect }: PlaylistsViewProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Load playlists on mount and when refreshKey changes
  useEffect(() => {
    loadPlaylists();
  }, [userId, refreshKey]);

  const loadPlaylists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await playlistService.getPlaylists(userId);
      setPlaylists(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load playlists';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalType('add');
  };

  const handleOpenEditModal = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setModalType('edit');
  };

  const handleOpenDeleteModal = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setModalType('delete');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedPlaylist(null);
  };

  const handlePlaylistCreated = (newPlaylist: Playlist) => {
    setPlaylists([newPlaylist, ...playlists]);
    handleCloseModal();
  };

  const handlePlaylistUpdated = (updatedPlaylist: Playlist) => {
    setPlaylists(
      playlists.map((p) => (p.id === updatedPlaylist.id ? updatedPlaylist : p))
    );
    handleCloseModal();
  };

  const handlePlaylistDeleted = () => {
    if (selectedPlaylist) {
      setPlaylists(playlists.filter((p) => p.id !== selectedPlaylist.id));
    }
    handleCloseModal();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>My Playlists</h2>
        <p style={styles.loadingText}>Loading playlists...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>My Playlists</h2>
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

  if (playlists.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h2 style={styles.title}>My Playlists</h2>
        </div>
        <div style={styles.emptyState}>
          <p>No playlists yet</p>
          <p style={styles.emptyStateText}>
            Create your first playlist to start organizing your music.
          </p>
          <button
            style={styles.primaryButton}
            onClick={handleOpenAddModal}
          >
            + Create Playlist
          </button>
        </div>

        {modalType === 'add' && (
          <AddPlaylistModal
            userId={userId}
            onClose={handleCloseModal}
            onPlaylistCreated={handlePlaylistCreated}
          />
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>My Playlists</h2>
        <button
          style={styles.addButton}
          onClick={handleOpenAddModal}
          aria-label="Add new playlist"
        >
          + Add Playlist
        </button>
      </div>

      <div style={styles.playlistGrid}>
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            style={styles.playlistCard}
            onClick={() => onPlaylistSelect?.(playlist)}
          >
            <h3 style={styles.playlistName}>{playlist.name}</h3>
            {playlist.description && (
              <p style={styles.playlistDescription}>{playlist.description}</p>
            )}
            <div style={styles.playlistFooter}>
              <span style={styles.songCount}>0 songs</span>
              <span style={styles.createdDate}>
                {formatDate(playlist.created_at)}
              </span>
            </div>
            <div style={styles.playlistActions}>
              <button
                style={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditModal(playlist);
                }}
              >
                Edit
              </button>
              <button
                style={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Open SharePlaylistModal (Phase 2c)
                  alert('Share Playlist feature coming soon!');
                }}
              >
                Share
              </button>
              <button
                style={{ ...styles.actionButton, ...styles.deleteButton }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDeleteModal(playlist);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalType === 'add' && (
        <AddPlaylistModal
          userId={userId}
          onClose={handleCloseModal}
          onPlaylistCreated={handlePlaylistCreated}
        />
      )}

      {modalType === 'edit' && selectedPlaylist && (
        <EditPlaylistModal
          playlist={selectedPlaylist}
          onClose={handleCloseModal}
          onPlaylistUpdated={handlePlaylistUpdated}
        />
      )}

      {modalType === 'delete' && selectedPlaylist && (
        <DeletePlaylistModal
          playlist={selectedPlaylist}
          onClose={handleCloseModal}
          onPlaylistDeleted={handlePlaylistDeleted}
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
  playlistGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  playlistCard: {
    backgroundColor: 'white',
    border: '1px solid #E0E0E0',
    borderRadius: '8px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  },
  playlistName: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#191414',
    margin: '0 0 0.5rem 0',
  },
  playlistDescription: {
    fontSize: '0.9rem',
    color: '#666',
    margin: '0 0 1rem 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  playlistFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#999',
    marginBottom: '1rem',
    borderBottom: '1px solid #E0E0E0',
    paddingBottom: '1rem',
  },
  songCount: {
    fontWeight: 'bold',
  },
  createdDate: {
    fontSize: '0.8rem',
  },
  playlistActions: {
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
