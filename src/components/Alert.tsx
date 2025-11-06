// src/components/Alert.tsx
import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string; // Optional title
  message: string;
  className?: string; // Allow additional custom styling
}

const alertStyles = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />,
    titleText: 'text-red-800',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />,
    titleText: 'text-green-800',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    icon: <AlertTriangle className="h-5 w-5 text-yellow-500" aria-hidden="true" />,
    titleText: 'text-yellow-800',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: <Info className="h-5 w-5 text-blue-500" aria-hidden="true" />,
    titleText: 'text-blue-800',
  },
};

const Alert: React.FC<AlertProps> = ({ type, title, message, className = '' }) => {
  const styles = alertStyles[type];

  return (
    <div
      className={`rounded-md border p-4 shadow-sm ${styles.bg} ${styles.border} ${className}`}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={`text-sm font-semibold ${styles.titleText}`}>
              {title}
            </h3>
          )}
          <div className={`mt-1 text-sm ${styles.text}`}>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;