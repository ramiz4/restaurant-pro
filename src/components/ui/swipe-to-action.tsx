import React, { ReactNode, useState } from "react";

import { useTouchGestures } from "@/hooks/use-touch-gestures";
import { cn } from "@/lib/utils";

export interface SwipeAction {
  id: string;
  label: string;
  icon?: ReactNode;
  color?: "primary" | "secondary" | "destructive" | "success";
  onAction: () => void;
}

export interface SwipeToActionProps {
  children: ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  className?: string;
  disabled?: boolean;
  threshold?: number;
}

export function SwipeToAction({
  children,
  leftActions = [],
  rightActions = [],
  className,
  disabled = false,
  threshold = 80,
}: SwipeToActionProps) {
  const [swipeState, setSwipeState] = useState<{
    isRevealed: boolean;
    direction: "left" | "right" | null;
    translateX: number;
  }>({
    isRevealed: false,
    direction: null,
    translateX: 0,
  });

  const resetSwipe = () => {
    setSwipeState({
      isRevealed: false,
      direction: null,
      translateX: 0,
    });
  };

  const touchGestures = useTouchGestures({
    onSwipeLeft: () => {
      if (disabled || rightActions.length === 0) return;
      setSwipeState({
        isRevealed: true,
        direction: "right",
        translateX: -threshold,
      });
    },
    onSwipeRight: () => {
      if (disabled || leftActions.length === 0) return;
      setSwipeState({
        isRevealed: true,
        direction: "left",
        translateX: threshold,
      });
    },
    onTap: resetSwipe,
    swipeThreshold: threshold / 2,
  });

  const getActionColor = (color: SwipeAction["color"]) => {
    switch (color) {
      case "primary":
        return "bg-primary text-primary-foreground hover:bg-primary/90";
      case "secondary":
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
      case "destructive":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
      case "success":
        return "bg-green-500 text-white hover:bg-green-600";
      default:
        return "bg-muted text-muted-foreground hover:bg-muted/80";
    }
  };

  const handleActionClick = (action: SwipeAction) => {
    action.onAction();
    resetSwipe();
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Left Actions */}
      {leftActions.length > 0 && swipeState.direction === "left" && (
        <div className="absolute inset-y-0 left-0 flex items-center">
          {leftActions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={cn(
                "h-full px-4 flex items-center justify-center min-w-[60px] transition-colors",
                getActionColor(action.color),
                index === 0 && "rounded-l-lg",
                index === leftActions.length - 1 && "rounded-r-lg",
              )}
              style={{
                transform: `translateX(${Math.max(0, swipeState.translateX - index * 60)}px)`,
              }}
            >
              {action.icon && <span className="mr-1">{action.icon}</span>}
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && swipeState.direction === "right" && (
        <div className="absolute inset-y-0 right-0 flex items-center">
          {rightActions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={cn(
                "h-full px-4 flex items-center justify-center min-w-[60px] transition-colors",
                getActionColor(action.color),
                index === 0 && "rounded-r-lg",
                index === rightActions.length - 1 && "rounded-l-lg",
              )}
              style={{
                transform: `translateX(${Math.min(0, swipeState.translateX + index * 60)}px)`,
              }}
            >
              {action.icon && <span className="mr-1">{action.icon}</span>}
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "transition-transform duration-200 ease-out bg-background",
          swipeState.isRevealed && "shadow-lg",
        )}
        style={{
          transform: `translateX(${swipeState.translateX}px)`,
        }}
        {...touchGestures}
      >
        {children}
      </div>
    </div>
  );
}
