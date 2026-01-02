// components/Common/Toast.tsx
import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  const bgColor = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  const Icon = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
  }[type];

  return (
    <div className={`flex items-center justify-between gap-4 p-4 rounded-md text-white shadow-lg ${bgColor} animate-in fade-in-0 slide-in-from-right-full duration-300 ease-out`}>
      <div className="flex items-center gap-2">
        <Icon size={20} />
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button onClick={() => onClose(id)} className="p-1 rounded-full hover:bg-black/20 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
