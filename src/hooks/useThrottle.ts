import { useState, useEffect, useRef } from 'react';

/**
 * A hook that limits the rate at which a function can be called.
 * Unlike debounce which waits for a period of inactivity, throttle
 * ensures a function is called at most once in a specified time period.
 * 
 * @param value The value to throttle
 * @param limit The minimum time between updates in milliseconds
 * @returns The throttled value
 */
function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated.current;
    
    if (timeSinceLastUpdate >= limit) {
      // If enough time has passed, update the throttled value immediately
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      // Otherwise, schedule an update for when the limit has passed
      const timeoutId = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, limit - timeSinceLastUpdate);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [value, limit]);

  return throttledValue;
}

export default useThrottle;
