import { useCallback, useRef, useState } from "react";

export interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

export interface TouchGestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function useTouchGestures(
  options: TouchGestureOptions = {},
): TouchGestureHandlers {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
    onTap,
    onDoubleTap,
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
  } = options;
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );
  const longPressTimer = useRef<number | null>(null);
  const lastTap = useRef<number>(0);
  const [isLongPress, setIsLongPress] = useState(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      setIsLongPress(false); // Start long press timer
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          setIsLongPress(true);
          onLongPress();
          // Provide haptic feedback if available
          if ("vibrate" in navigator) {
            navigator.vibrate(50);
          }
        }, longPressDelay) as unknown as number;
      }
    },
    [onLongPress, longPressDelay],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;

      const touch = e.touches[0];
      if (!touch) return;

      const deltaX = Math.abs(touch.clientX - touchStart.current.x);
      const deltaY = Math.abs(touch.clientY - touchStart.current.y);

      // Cancel long press if finger moves too much
      if (deltaX > 10 || deltaY > 10) {
        clearLongPressTimer();
      }
    },
    [clearLongPressTimer],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      clearLongPressTimer();

      if (!touchStart.current || isLongPress) {
        touchStart.current = null;
        return;
      }

      const touch = e.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;
      const deltaTime = Date.now() - touchStart.current.time;

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Check for swipe gestures
      if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      } else if (deltaTime < 300 && absDeltaX < 10 && absDeltaY < 10) {
        // Check for tap/double tap
        const now = Date.now();
        const timeSinceLastTap = now - lastTap.current;

        if (timeSinceLastTap < doubleTapDelay && onDoubleTap) {
          onDoubleTap();
          lastTap.current = 0; // Reset to prevent triple tap
        } else {
          lastTap.current = now;
          // Delay single tap to allow for double tap detection
          setTimeout(() => {
            if (lastTap.current === now && onTap) {
              onTap();
            }
          }, doubleTapDelay);
        }
      }

      touchStart.current = null;
    },
    [
      clearLongPressTimer,
      isLongPress,
      swipeThreshold,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      onTap,
      onDoubleTap,
      doubleTapDelay,
    ],
  );

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
