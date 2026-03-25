/**
 * App Root Component
 * Main component that handles routing between login and dashboard
 */

import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import './App.css';

function App() {
  const { user, isLoading, logout } = useAuth();

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

  return <Dashboard user={user} onLogout={logout} />;
}

export default App;
