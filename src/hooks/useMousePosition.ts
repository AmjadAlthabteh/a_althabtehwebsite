import { useState, useEffect, useCallback } from 'react';

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

// Shared global mouse position to avoid multiple event listeners
let globalMousePosition: MousePosition = {
  x: 0,
  y: 0,
  normalizedX: 0,
  normalizedY: 0
};

const subscribers = new Set<(pos: MousePosition) => void>();
let isListening = false;

const handleMouseMove = (e: MouseEvent) => {
  globalMousePosition = {
    x: e.clientX,
    y: e.clientY,
    normalizedX: (e.clientX / window.innerWidth) * 2 - 1,
    normalizedY: -((e.clientY / window.innerHeight) * 2 - 1)
  };

  // Notify all subscribers
  subscribers.forEach(callback => callback(globalMousePosition));
};

const startListening = () => {
  if (!isListening) {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    isListening = true;
  }
};

const stopListening = () => {
  if (isListening && subscribers.size === 0) {
    window.removeEventListener('mousemove', handleMouseMove);
    isListening = false;
  }
};

/**
 * Hook to track mouse position efficiently
 * Uses a shared event listener to reduce overhead
 * @param throttleMs - Optional throttle interval in ms (default: 0 for no throttling)
 */
export const useMousePosition = (throttleMs: number = 0) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>(globalMousePosition);

  const updatePosition = useCallback((pos: MousePosition) => {
    setMousePosition(pos);
  }, []);

  useEffect(() => {
    let timeoutId: number | null = null;
    let lastUpdate = 0;

    const throttledUpdate = (pos: MousePosition) => {
      if (throttleMs === 0) {
        updatePosition(pos);
        return;
      }

      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdate;

      if (timeSinceLastUpdate >= throttleMs) {
        updatePosition(pos);
        lastUpdate = now;
      } else {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(() => {
          updatePosition(pos);
          lastUpdate = Date.now();
        }, throttleMs - timeSinceLastUpdate);
      }
    };

    subscribers.add(throttledUpdate);
    startListening();

    // Set initial position
    setMousePosition(globalMousePosition);

    return () => {
      subscribers.delete(throttledUpdate);
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      stopListening();
    };
  }, [throttleMs, updatePosition]);

  return mousePosition;
};
