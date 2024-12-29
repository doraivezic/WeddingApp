import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LanguageContext } from '../contexts/LanguageContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faInfoCircle } from '@fortawesome/free-solid-svg-icons'; // Import eye icons

const apiUrl = process.env.REACT_APP_API_URL || '';

const Home = () => {
  const { login } = useContext(AuthContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [showInfo, setShowInfo] = useState(false);

  const togglePasswordVisibility = () => {
      setShowPassword(!showPassword); // Toggle the visibility state
  };

  const toggleInfoVisibility = () => {
    setShowInfo(!showInfo); // Toggle the info box visibility
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${apiUrl}/api/login`, {
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
          window.scrollTo(0, 0);
        } else {
          navigate('/guest-details');
          window.scrollTo(0, 0);
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
        <button onClick={toggleLanguage} className="language-toggle">
            {language === 'en' ? 'EN' : 'HR'}
        </button>

        <div className="hero-container">
          <img src="/image.png" alt="Dora-Marin" className="hero-image" />
          <div className="hero-text">
            <h1 className='typing-effect'>Dora & Marin</h1>
            <p style={{fontSize: '1.3rem', fontFamily: 'Raleway'}}>01.03.2025.</p>
          </div>
          <div className="separator"></div>
        </div>

        {/* 
        <div className="fixed-image-container">
          <div className="background-image">
            <div className="background-text">
              <h1>{language === 'en' ? 'Welcome to Our Wedding' : 'Dobrodošli na naše vjenčanje'}</h1>
            </div>
          </div>
          <div className="separator"></div>
        </div> */}

        <div className="content-container" style={{ position: 'relative' }}>
          <form className="login-form" onSubmit={handleLogin} style={{ position: 'relative'}}>
        
            {showInfo && (
              <div className='info-box'>
                <p style={{margin:'0'}}>
                  {language === 'en' ? 
                    <>Please insert the assigned credentials received on the invitation.<br />In case of a problem, please contact Dora.</> :
                    <>Molimo unesite dodijeljene informacije primljene na pozivnici.<br />U slučaju problema, molimo kontaktirajte Doru.</>}
                </p>
              </div>
            )}

            <span
                onClick={toggleInfoVisibility}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    cursor: 'pointer',
                    // border: '1px solid black',
                    // borderRadius: '50%',
                    // // lineHeight: '16px',
                    // height: '16px',
                    // width: '16px',
                }}
            >
                <FontAwesomeIcon icon={faInfoCircle} className='info-icon' style={{fontSize: '19px'}} />
            </span>

            <div>
              <label style={{fontFamily: 'Manrope', fontWeight: '500'}}>{language === 'en' ? 'Username' : 'Korisničko ime'}</label>
              <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
              />
            </div>
            <div>
              <label style={{fontFamily: 'Manrope', fontWeight: '500'}}>{language === 'en' ? 'Password' : 'Lozinka'}</label>
              {/* Dodaj botuncic za pomoc */}
              {/* <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              /> */}
              
              <div style={{ position: 'relative' }}> {/* Adjust width as needed */}
                <input
                    type={showPassword ? 'text' : 'password'} // Change input type based on state
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                        width: '100%',
                        padding: '10px 40px 10px 10px', // Add padding for the icon
                        boxSizing: 'border-box', // Ensure padding is included in width
                        border: '1px solid #ccc', // Optional: border styling
                        borderRadius: '5px', // Optional: border radius
                    }}
                />
                <span
                    onClick={togglePasswordVisibility}
                    style={{
                        position: 'absolute',
                        right: '12px', // Position the icon 10px from the right
                        top: '50%', // Center vertically
                        transform: 'translateY(-50%)', // Adjust for vertical centering
                        cursor: 'pointer',
                        zIndex: 1, // Ensure the icon is above the input
                    }}
                >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} 
                      style={{ color: 'silver', fontSize: '12px' }} />
                </span>
            </div>
        
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit">{language === 'en' ? 'Login' : 'Prijava'}</button>
          </form>
        </div>


        {/* <div className="login-container">
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
        </div> */}
      </>
  );
};

export default Home;
