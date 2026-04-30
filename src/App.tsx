import { useState, useEffect } from 'react';
import { Analyzer } from './pages/Analyzer';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { authService } from './auth/authService';
import type { User } from './types/auth';

type Page = 'login' | 'home' | 'analyzer';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    setPage('analyzer');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setPage('home');
  };

  const handleGoToAnalyzer = () => {
    if (user) {
      setPage('analyzer');
    } else {
      setPage('login');
    }
  };

  if (page === 'login') {
    return <LoginPage onLogin={handleLogin} onBack={() => setPage('home')} />;
  }

  if (page === 'home') {
    return (
      <HomePage 
        user={user} 
        onLogout={handleLogout} 
        onGoToAnalyzer={handleGoToAnalyzer} 
        onGoToLogin={() => setPage('login')}
      />
    );
  }

  if (page === 'analyzer') {
    return <Analyzer onBack={() => setPage('home')} />;
  }

  return null;
}
