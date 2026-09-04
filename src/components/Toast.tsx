import React from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 20, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl"
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && (
                <div className="w-6 h-6 rounded-full bg-[#00ED64]/15 flex items-center justify-center text-[#00ED64] border border-[#00ED64]/30">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {toast.type === 'orange' && (
                <div className="w-6 h-6 rounded-full bg-[#00ED64]/15 flex items-center justify-center text-[#00ED64] border border-[#00ED64]/30">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
                  <Info className="w-4 h-4" />
                </div>
              )}
              {toast.type === 'warning' && (
                <div className="w-6 h-6 rounded-full bg-amber-950/40 flex items-center justify-center text-amber-400 border border-amber-700/50">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white leading-snug">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.15, backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
