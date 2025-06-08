import React, { ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTouchGestures } from "@/hooks/use-touch-gestures";
import { cn } from "@/lib/utils";

export interface MobileContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  action: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface MobileContextMenuProps {
  children: ReactNode;
  items: MobileContextMenuItem[];
  className?: string;
  disabled?: boolean;
  triggerClassName?: string;
}

export function MobileContextMenu({
  children,
  items,
  className,
  disabled = false,
  triggerClassName,
}: MobileContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const touchGestures = useTouchGestures({
    onLongPress: () => {
      if (!disabled && isMobile) {
        setIsOpen(true);
      }
    },
  });

  const handleItemClick = (item: MobileContextMenuItem) => {
    if (!item.disabled) {
      item.action();
    }
    setIsOpen(false);
  };

  // On desktop, use the regular context menu
  if (!isMobile) {
    return (
      <ContextMenu>
        <ContextMenuTrigger className={triggerClassName}>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent>
          {items.map((item) => (
            <ContextMenuItem
              key={item.id}
              onClick={item.action}
              disabled={item.disabled}
              className={cn(
                item.destructive && "text-destructive focus:text-destructive",
                item.disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  // On mobile, use long-press to open a dialog
  return (
    <>
      <div
        className={cn("touch-manipulation", className, triggerClassName)}
        {...touchGestures}
      >
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Actions</DialogTitle>
            <DialogDescription>Choose an action to perform</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {items.map((item) => (
              <Button
                key={item.id}
                variant={item.destructive ? "destructive" : "outline"}
                className="justify-start h-12"
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
              >
                {item.icon && <span className="mr-3">{item.icon}</span>}
                {item.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="mt-2"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
