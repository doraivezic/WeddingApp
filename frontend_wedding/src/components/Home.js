import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LanguageContext } from '../contexts/LanguageContext';

const Home = () => {
  const { login } = useContext(AuthContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.role, data.username);
        if (data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/guest-details');
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
      <>
        <div className="fixed-image-container">
          <div className="background-image">
            <div className="background-text">
              <h1>{language === 'en' ? 'Welcome to Our Wedding' : 'Dobrodošli na naše vjenčanje'}</h1>
            </div>
          </div>
          <div className="separator"></div>
        </div>
        <div className="login-container">
          <form onSubmit={handleLogin}>
            <div>
              <label>{language === 'en' ? 'Username:' : 'Korisničko ime:'}</label>
              <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
              />
            </div>
            <div>
              <label>{language === 'en' ? 'Password:' : 'Lozinka:'}</label>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit">{language === 'en' ? 'Login' : 'Prijava'}</button>
          </form>
          <button onClick={toggleLanguage} style={{position: 'absolute', top: '10px', right: '10px'}}>
            {language === 'en' ? 'EN' : 'HR'}
          </button>
        </div>
      </>
  );
};

export default Home;
