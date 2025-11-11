import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

/**
 * Hook to show toast notifications
 * Usage: const toast = useToast();
 *        toast.success('Goal saved!')
 *        toast.error('Error saving goal')
 *        toast.info('Loading...')
 *        toast.warning('Be careful!')
 */
export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
};
