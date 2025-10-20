import { useEffect, useCallback } from 'react';

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 хвилин

export const useSync = (syncFunction, dependencies = []) => {
  const sync = useCallback(() => {
    if (typeof syncFunction === 'function') {
      syncFunction();
    }
  }, [syncFunction]);

  useEffect(() => {
    // Початкова синхронізація
    sync();

    // Встановлюємо інтервал
    const interval = setInterval(sync, SYNC_INTERVAL);

    // Синхронізація при поверненні на вкладку
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        sync();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sync, ...dependencies]);
};