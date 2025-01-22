import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationBanner from './components/NotificationBanner';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [visible,setVisible] = useState()

  const showNotification = useCallback((title, message,data) => {
    setNotification({ title, message,data });
    setVisible(true)
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setNotification(null);
      setVisible(false)
    }, 5000);

    return () => timer()
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <NotificationBanner
        visible={visible}
        title={notification.title}
        message={notification.message}
        />
      )}
    </NotificationContext.Provider>
  );
};
