import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import GuestDetails from './components/GuestDetails';
import Admin from './components/Admin';
import { LanguageProvider, LanguageContext } from './contexts/LanguageContext';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './global.css';

const LanguageToggleButton = () => {
  const { language, toggleLanguage } = useContext(LanguageContext);
  return (
    <button onClick={toggleLanguage} className="language-toggle">
      {language === 'en' ? 'EN' : 'HR'}
    </button>
  );
};

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    window.scrollTo(0, 0);
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
};

const ProtectedRoute = ({ role, component: Component }) => {
  const { userRole } = useContext(AuthContext);

  if (userRole === role) {
    return (
      <div>
        <LogoutButton />
        <Component />
      </div>
    );
  }

  return <Navigate to="/" />;
};

function App() {
  return (
    <NotificationProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="container">
              <LanguageToggleButton />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/guest-details" element={<ProtectedRoute role="guest" component={GuestDetails} />} />
                <Route path="/admin" element={<ProtectedRoute role="admin" component={Admin} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </NotificationProvider>
  );
}

export default App;
