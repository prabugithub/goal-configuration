import React, { createContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

/**
 * ToastContext - Global toast notification system
 * Manages all toast notifications across the app
 */
export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'success', // success | error | warning | info
    duration: 3000,
  });

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    setToast({
      open: true,
      message,
      type,
      duration,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const value = {
    success: (message, duration = 3000) => showToast(message, 'success', duration),
    error: (message, duration = 5000) => showToast(message, 'error', duration),
    warning: (message, duration = 4000) => showToast(message, 'warning', duration),
    info: (message, duration = 3000) => showToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={toast.duration}
        onClose={hideToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={hideToast}
          severity={toast.type}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
