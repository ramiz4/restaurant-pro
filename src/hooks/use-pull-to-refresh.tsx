import { useCallback, useEffect, useRef, useState } from "react";

export interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  refreshDistance?: number;
  disabled?: boolean;
}

export interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  shouldRefresh: boolean;
}

export function usePullToRefresh(options: PullToRefreshOptions) {
  const {
    onRefresh,
    threshold = 80,
    refreshDistance = 120,
    disabled = false,
  } = options;

  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    shouldRefresh: false,
  });

  const startY = useRef<number>(0);
  const pullStarted = useRef<boolean>(false);

  const reset = useCallback(() => {
    setState({
      isPulling: false,
      isRefreshing: false,
      pullDistance: 0,
      shouldRefresh: false,
    });
    pullStarted.current = false;
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || window.scrollY > 0) return;

      startY.current = e.touches[0].clientY;
    },
    [disabled],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || window.scrollY > 0 || !startY.current) return;

      const currentY = e.touches[0].clientY;
      const pullDistance = Math.max(0, currentY - startY.current);

      if (pullDistance > 10 && !pullStarted.current) {
        pullStarted.current = true;
        setState((prev) => ({ ...prev, isPulling: true }));
      }

      if (pullStarted.current) {
        // Reduce pull distance for a more natural feel
        const dampedDistance = Math.min(
          pullDistance * 0.6,
          refreshDistance * 1.2,
        );

        setState((prev) => ({
          ...prev,
          pullDistance: dampedDistance,
          shouldRefresh: dampedDistance >= threshold,
        }));

        // Provide haptic feedback when threshold is reached
        if (dampedDistance >= threshold && !state.shouldRefresh) {
          if ("vibrate" in navigator) {
            navigator.vibrate(30);
          }
        }
      }
    },
    [disabled, threshold, refreshDistance, state.shouldRefresh],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!pullStarted.current || disabled) {
      reset();
      return;
    }

    if (state.shouldRefresh) {
      setState((prev) => ({
        ...prev,
        isRefreshing: true,
        isPulling: false,
      }));

      try {
        await onRefresh();
      } catch (error) {
        console.error("Pull to refresh failed:", error);
      } finally {
        // Add a small delay for better UX
        setTimeout(reset, 300);
      }
    } else {
      reset();
    }
  }, [disabled, state.shouldRefresh, onRefresh, reset]);

  useEffect(() => {
    const element = document.body;

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ...state,
    progress: Math.min(state.pullDistance / threshold, 1),
    reset,
  };
}
