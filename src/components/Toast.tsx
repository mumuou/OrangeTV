'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };

    setToasts(prev => [...prev, newToast]);

    // 自动移除toast
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  const getToastIcon = (type: ToastType) => {
    const iconSize = isMobile ? 'w-4 h-4' : 'w-5 h-5';
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconSize} flex-shrink-0 text-green-500`} />;
      case 'error':
        return <XCircle className={`${iconSize} flex-shrink-0 text-red-500`} />;
      case 'warning':
        return <AlertCircle className={`${iconSize} flex-shrink-0 text-yellow-500`} />;
      case 'info':
        return <Info className={`${iconSize} flex-shrink-0 text-blue-500`} />;
    }
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
    }
  };

  const toastContainer = mounted && toasts.length > 0 && (
    <div
      className={`fixed ${isMobile ? 'space-y-1' : 'space-y-2'} ${isMobile
        ? 'top-14 left-3 right-3 max-w-none z-[2147483648]'
        : 'top-4 right-4 max-w-sm w-full z-[9999]'
        }`}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-start gap-3 rounded-lg border shadow-lg
            transform transition-all duration-300 ease-out
            ${isMobile ? 'p-3 text-sm' : 'p-4'}
            ${isMobile ? 'animate-in slide-in-from-top-2' : 'animate-in slide-in-from-right-2'}
            ${getToastStyles(toast.type)}
          `}
        >
          {getToastIcon(toast.type)}
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>{toast.title}</h4>
            {toast.message && (
              <p className={`opacity-90 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className={`flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity ${isMobile ? 'p-1' : ''
              }`}
          >
            <X className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {mounted && createPortal(toastContainer, document.body)}
    </ToastContext.Provider>
  );
};
