import { useState, useCallback, useRef, useEffect } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    const toastTimeouts = toastTimeoutsRef.current;
    return () => {
      toastTimeouts.forEach(clearTimeout);
    };
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    const timeout = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      toastTimeoutsRef.current.delete(timeout);
    }, 3000);
    toastTimeoutsRef.current.add(timeout);
  }, []);

  return { toasts, addToast };
}
