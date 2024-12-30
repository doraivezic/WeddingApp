import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000); // Auto-dismiss after 5 seconds
  };

  const styles = {
    container: {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000, // Ensure it appears above other elements
      width: '90%', // Adjust width as needed
      maxWidth: '400px', // Limit maximum width
    },
    base: {
      padding: '10px 15px',
      borderRadius: '5px',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    success: {
      backgroundColor: '#e6ffed',
      color: '#2b8a3e',
      border: '1px solid #a8dfc1',
    },
    error: {
      backgroundColor: '#ffe6e6',
      color: '#d32f2f',
      border: '1px solid #ffb3b3',
    },
  };

  const icons = {
    success: '✔️',
    error: '❌',
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div style={styles.container}>
          <div style={{ ...styles.base, ...(notification.type === 'success' ? styles.success : styles.error) }}>
            <span>{icons[notification.type]}</span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
