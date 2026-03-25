/**
 * TopBar Component
 * Header bar with app title and user menu
 */

import { useState } from 'react';
import { User } from '../types';

interface TopBarProps {
  user: User;
  onLogout: () => void;
}

export function TopBar({ user, onLogout }: TopBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout();
  };

  return (
    <div style={styles.topBar}>
      <div style={styles.leftSection}>
        <h1 style={styles.title}>🎵 Music Player</h1>
      </div>

      <div style={styles.rightSection}>
        <div style={styles.userMenuContainer}>
          <button
            style={styles.userButton}
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
          >
            👤 {user.email}
          </button>

          {showUserMenu && (
            <div style={styles.userMenuDropdown}>
              <div style={styles.userEmail}>{user.email}</div>
              <button
                style={styles.logoutButton}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  topBar: {
    height: '60px',
    backgroundColor: '#191414',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    boxSizing: 'border-box',
    borderBottom: '1px solid #E0E0E0',
    flexShrink: 0,
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    color: 'white',
    fontWeight: 'bold',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
  },
  userMenuContainer: {
    position: 'relative',
  },
  userButton: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid white',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
  },
  userMenuDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    backgroundColor: 'white',
    border: '1px solid #E0E0E0',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    minWidth: '200px',
    zIndex: 100,
    overflow: 'hidden',
  },
  userEmail: {
    padding: '0.75rem 1rem',
    color: '#333',
    fontSize: '0.9rem',
    borderBottom: '1px solid #E0E0E0',
    fontWeight: 500,
  },
  logoutButton: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: 'transparent',
    color: '#d32f2f',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    textAlign: 'left',
    fontWeight: 500,
  },
};
