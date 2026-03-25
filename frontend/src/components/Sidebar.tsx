/**
 * Sidebar Component
 * Navigation menu with playlist management, songs, and user info
 */

import { User } from '../types';

interface SidebarProps {
  selectedView: string;
  onSelectView: (view: string) => void;
  user: User;
  onLogout: () => void;
}

export function Sidebar({ selectedView, onSelectView, user, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'playlists', label: 'Playlists', icon: '📋' },
    { id: 'songs', label: 'Songs', icon: '🎵' },
    { id: 'shared', label: 'Shared with Me', icon: '🔗' },
  ];

  return (
    <div style={styles.sidebar}>
      {/* Menu Header */}
      <div style={styles.sidebarHeader}>
        <span style={styles.headerIcon}>≡</span>
        <span style={styles.headerTitle}>Music Player</span>
      </div>

      {/* Menu Items */}
      <nav style={styles.menuContainer}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            style={{
              ...styles.menuItem,
              ...(selectedView === item.id ? styles.menuItemActive : {}),
            }}
            onClick={() => onSelectView(item.id)}
            aria-current={selectedView === item.id ? 'page' : undefined}
          >
            <span style={styles.menuIcon}>{item.icon}</span>
            <span style={styles.menuLabel}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Info Section */}
      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <span style={styles.userLabel}>User:</span>
          <span style={styles.userEmail}>{user.email}</span>
        </div>
        <button
          style={styles.logoutButton}
          onClick={onLogout}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '250px',
    backgroundColor: '#f5f5f5',
    borderRight: '1px solid #E0E0E0',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    height: '100%',
  },
  sidebarHeader: {
    padding: '1.5rem 1rem',
    borderBottom: '1px solid #E0E0E0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 'bold',
    color: '#191414',
  },
  headerIcon: {
    fontSize: '1.2rem',
  },
  headerTitle: {
    fontSize: '1rem',
  },
  menuContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem 0',
    listStyle: 'none',
    margin: 0,
  },
  menuItem: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '0.75rem 1rem',
    textAlign: 'left',
    cursor: 'pointer',
    color: '#333',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'background-color 0.2s ease',
  },
  menuItemActive: {
    backgroundColor: '#1DB954',
    color: 'white',
    fontWeight: 'bold',
  },
  menuIcon: {
    fontSize: '1.2rem',
  },
  menuLabel: {
    flex: 1,
  },
  userSection: {
    borderTop: '1px solid #E0E0E0',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    backgroundColor: 'white',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  userLabel: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: 500,
  },
  userEmail: {
    fontSize: '0.9rem',
    color: '#333',
    fontWeight: 500,
    wordBreak: 'break-all',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f5f5f5',
    color: '#d32f2f',
    border: '1px solid #d32f2f',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    fontWeight: 500,
  },
};
