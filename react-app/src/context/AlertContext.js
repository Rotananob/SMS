import React, { createContext, useState, useContext, useCallback } from 'react';
import AlertModal from '../components/AlertModal';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((config) => {
    const {
      title = 'Alert',
      message = '',
      type = 'info',
      buttons = ['OK'],
      onConfirm,
      onCancel
    } = config;

    const id = Date.now();
    setAlerts(prev => [...prev, {
      id,
      title,
      message,
      type,
      buttons,
      onConfirm: () => {
        onConfirm?.();
        setAlerts(prev => prev.filter(a => a.id !== id));
      },
      onCancel: () => {
        onCancel?.();
        setAlerts(prev => prev.filter(a => a.id !== id));
      }
    }]);

    return id;
  }, []);

  const closeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert }}>
      {children}
      <div className="alert-modal-container">
        {alerts.map(alert => (
          <AlertModal
            key={alert.id}
            title={alert.title}
            message={alert.message}
            type={alert.type}
            buttons={alert.buttons}
            onConfirm={alert.onConfirm}
            onCancel={alert.onCancel}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export default AlertContext;
