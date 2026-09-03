import React, { createContext, useContext, useState, useCallback } from 'react';
import { IconCheck, IconAlert, IconInfo, IconX } from './icons';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback((type, message) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => dismiss(id), 5000);
    }, [dismiss]);

    const toast = {
        success: (msg) => push('success', msg),
        error: (msg) => push('error', msg),
        info: (msg) => push('info', msg),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 max-w-sm sm:ml-auto">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className="panel px-4 py-3 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
                    >
                        <span className={
                            t.type === 'success' ? 'text-success shrink-0 mt-0.5' :
                                t.type === 'error' ? 'text-danger shrink-0 mt-0.5' :
                                    'text-accent shrink-0 mt-0.5'
                        }>
                            {t.type === 'success' && <IconCheck size={16} />}
                            {t.type === 'error' && <IconAlert size={16} />}
                            {t.type === 'info' && <IconInfo size={16} />}
                        </span>
                        <p className="text-sm text-paper flex-1 leading-snug">{t.message}</p>
                        <button onClick={() => dismiss(t.id)} className="text-muted hover:text-paper shrink-0">
                            <IconX size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}