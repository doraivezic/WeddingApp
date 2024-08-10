import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import GuestDetails from './components/GuestDetails';
import Admin from './components/Admin';
import { LanguageProvider, LanguageContext } from './contexts/LanguageContext';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import './global.css';

const LanguageToggleButton = () => {
  const { language, toggleLanguage } = useContext(LanguageContext);
  return (
    <button onClick={toggleLanguage} style={{ position: 'absolute', top: '10px', right: '10px' }}>
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
  };

  return (
    <button onClick={handleLogout} style={{ position: 'absolute', top: '10px', right: '80px' }}>
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
  );
}

export default App;
