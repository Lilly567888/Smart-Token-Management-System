/**
 * Smart Token Management System - Toast Notification Container
 * Displays floating micro-alerts for token updates, appointments & system changes
 */

import React from 'react';
import { useQueue } from '../../context/QueueContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useQueue();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error'
            ? XCircle
            : toast.type === 'warning'
            ? AlertCircle
            : Info;

        const borderStyle =
          toast.type === 'success'
            ? 'border-emerald-200 bg-emerald-50/95 text-emerald-950'
            : toast.type === 'error'
            ? 'border-rose-200 bg-rose-50/95 text-rose-950'
            : toast.type === 'warning'
            ? 'border-amber-200 bg-amber-50/95 text-amber-950'
            : 'border-purple-200 bg-purple-50/95 text-purple-950';

        const iconColor =
          toast.type === 'success'
            ? 'text-emerald-600'
            : toast.type === 'error'
            ? 'text-rose-600'
            : toast.type === 'warning'
            ? 'text-amber-600'
            : 'text-purple-600';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-lg backdrop-blur-md flex items-start gap-3 transition-all animate-in slide-in-from-bottom-2 ${borderStyle}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
              <p className="text-[11px] opacity-90 mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
