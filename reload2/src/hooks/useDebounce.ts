import { useEffect, useState, useCallback } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [debouncedArgs, setDebouncedArgs] = useState<Parameters<T> | null>(null);

  useEffect(() => {
    if (debouncedArgs) {
      const handler = setTimeout(() => {
        callback(...debouncedArgs);
        setDebouncedArgs(null);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [debouncedArgs, callback, delay]);

  return useCallback((...args: Parameters<T>) => {
    setDebouncedArgs(args);
  }, []);
}