import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationBanner from './components/NotificationBanner';
import notifee from '@notifee/react-native'

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [visible,setVisible] = useState()

  const showNotification = useCallback(async (title, message,data) => {
    try{
        await notifee.requestPermission()
        await notifee.displayNotification({
            title: title,
            body:message,
            ios: {
                sound:'default'
            },
        });
        setNotification({ title, message,data });
        setVisible(true)
        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
          setNotification(null);
          setVisible(false)
        }, 5000);
        return () => timer()
    }catch(error){
        console.error('Error with notification permission:',error.message)
    }
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
