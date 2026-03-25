/**
 * App Root Component
 * Main component that handles routing between login and dashboard
 */

import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/LoginPage';
import './App.css';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <h1>🎵 Music Manager</h1>
        <p>User: {user.email}</p>
      </header>

      <main style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
        <h2>Welcome to Music Manager</h2>
        <p>This is a placeholder dashboard. More features coming soon!</p>
      </main>

      <footer style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderTop: '1px solid #ddd' }}>
        <p>Music Player (footer component placeholder)</p>
      </footer>
    </div>
  );
}

export default App;
