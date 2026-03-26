/**
 * Dashboard Component
 * Main application layout with sidebar, main content area, and music player
 */

import { useState } from 'react';
import { User, Song } from '../types';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { MusicPlayer } from './MusicPlayer';
import { PlaylistsView } from './PlaylistsView';
import { SongsView } from './SongsView';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [selectedView, setSelectedView] = useState<'playlists' | 'songs' | 'shared'>('playlists');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  return (
    <div style={styles.dashboardContainer}>
      {/* Top Navigation Bar */}
      <TopBar user={user} onLogout={onLogout} />

      {/* Main Content Area */}
      <div style={styles.mainArea}>
        {/* Sidebar Navigation */}
        <Sidebar
          selectedView={selectedView}
          onSelectView={(view) => setSelectedView(view as 'playlists' | 'songs' | 'shared')}
          user={user}
          onLogout={onLogout}
        />

        {/* Main Content */}
        <div style={styles.contentArea}>
          {selectedView === 'playlists' && <PlaylistsView userId={user.id} />}

          {selectedView === 'songs' && (
            <SongsView
              userId={user.id}
              onSongSelect={(song) => setSelectedSong(song)}
            />
          )}

          {selectedView === 'shared' && (
            <div style={styles.contentSection}>
              <h2 style={styles.contentTitle}>Shared with Me</h2>
              <p style={styles.placeholderText}>
                Shared playlists feature coming in Phase 3
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Music Player */}
      <MusicPlayer />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  dashboardContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  mainArea: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    backgroundColor: 'white',
  },
  contentSection: {
    padding: '2rem',
    flex: 1,
  },
  contentTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#191414',
    margin: '0 0 1rem 0',
  },
  placeholderText: {
    fontSize: '1rem',
    color: '#666',
    margin: 0,
  },
};
