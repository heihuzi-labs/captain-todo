import { useState, useEffect, useRef, useCallback } from 'react';

// Utility function to safely parse JSON from localStorage
function safeJSONParse<T>(value: string, fallback: T): T {
  try {
    const parsed = JSON.parse(value);
    return parsed;
  } catch (error) {
    return fallback;
  }
}

// Helper function to read from localStorage
function readFromLocalStorage<T>(key: string, initialValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    if (item === null || item === undefined || item === 'undefined' || item === 'null') {
      return initialValue;
    }
    return safeJSONParse(item, initialValue);
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    try {
      window.localStorage.removeItem(key);
    } catch (clearError) {
      console.error(`Error clearing localStorage key "${key}":`, clearError);
    }
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return readFromLocalStorage(key, initialValue);
  });

  // 使用 ref 保存待写入的值，避免频繁写入
  const pendingWriteRef = useRef<T | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-read from localStorage when key changes
  useEffect(() => {
    const newValue = readFromLocalStorage(key, initialValue);
    setStoredValue(newValue);
  }, [key]);

  // 异步批量写入 localStorage
  const flushToStorage = useCallback((value: T) => {
    try {
      // 使用 requestIdleCallback 或 setTimeout 延迟写入
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          window.localStorage.setItem(key, JSON.stringify(value));
        }, { timeout: 100 });
      } else {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  const setValue = useCallback((value: T) => {
    // 立即更新 React state
    setStoredValue(value);

    // 保存待写入的值
    pendingWriteRef.current = value;

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 延迟 50ms 写入，合并多次快速更新
    timeoutRef.current = setTimeout(() => {
      if (pendingWriteRef.current !== null) {
        flushToStorage(pendingWriteRef.current);
        pendingWriteRef.current = null;
      }
    }, 50);
  }, [flushToStorage]);

  // 清理
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // 组件卸载时立即写入
      if (pendingWriteRef.current !== null) {
        try {
          window.localStorage.setItem(key, JSON.stringify(pendingWriteRef.current));
        } catch (error) {
          console.error(`Error flushing localStorage key "${key}":`, error);
        }
      }
    };
  }, [key]);

  return [storedValue, setValue];
}
