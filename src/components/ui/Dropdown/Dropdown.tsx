import type {
  MouseEvent,
  ReactElement,
} from "react";

import {
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import { cn } from "@/lib/utils/cn";

import type {
  DropdownAlign,
  DropdownContentProps,
  DropdownGroupProps,
  DropdownItemProps,
  DropdownLabelProps,
  DropdownProps,
  DropdownSeparatorProps,
  DropdownSide,
  DropdownTriggerProps,
} from "./dropdown.types";

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  triggerElement: HTMLElement | null;
  setTriggerElement: (node: HTMLElement | null) => void;
}

interface DropdownComponent {
  (props: DropdownProps): ReactElement | null;

  Trigger: typeof DropdownTrigger;
  Content: typeof DropdownContent;
  Item: typeof DropdownItem;
  Label: typeof DropdownLabel;
  Separator: typeof DropdownSeparator;
  Group: typeof DropdownGroup;
}

const DropdownContext =
  createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error(
      "Dropdown components must be used inside <Dropdown>.",
    );
  }

  return context;
}

function DropdownRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: DropdownProps) {
  const [uncontrolledOpen, setUncontrolledOpen] =
    useState(defaultOpen);

  const [triggerElement, setTriggerElement] =
    useState<HTMLElement | null>(null);

  const open =
    controlledOpen !== undefined
      ? controlledOpen
      : uncontrolledOpen;

  const generatedId = useId();

  const contentId =
    `dropdown-content-${generatedId}`;

  const setOpen = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  return (
    <DropdownContext.Provider
      value={{
        open,
        setOpen,
        contentId,
        triggerElement,
        setTriggerElement,
      }}
    >
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

const DropdownTrigger = forwardRef<
  HTMLButtonElement,
  DropdownTriggerProps
>(function DropdownTrigger(
  {
    children,
    className,
    asChild = false,
    onClick,
    ...props
  },
  ref,
) {
  const {
    open,
    setOpen,
    contentId,
    setTriggerElement,
  } = useDropdownContext();

  const handleRef = (node: HTMLElement | null) => {
    setTriggerElement(node);

    if (typeof ref === "function") {
      ref(node as HTMLButtonElement | null);
    } else if (ref) {
      ref.current = node as HTMLButtonElement | null;
    }
  };

  const handleClick = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    onClick?.(event);

    if (!event.defaultPrevented) {
      setOpen(!open);
    }
  };

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{
      className?: string;
      onClick?: (
        event: MouseEvent<HTMLElement>,
      ) => void;
      "aria-expanded"?: boolean;
      "aria-haspopup"?: string;
      "aria-controls"?: string;
    }>;

    return (
      <span ref={handleRef} className="inline-flex">
        {Object.assign({}, child, {
          className: cn(
            child.props.className,
            className,
          ),
          "aria-expanded": open,
          "aria-haspopup": "menu",
          "aria-controls": open
            ? contentId
            : undefined,
          onClick: (
            event: MouseEvent<HTMLElement>,
          ) => {
            child.props.onClick?.(event);

            if (!event.defaultPrevented) {
              setOpen(!open);
            }
          },
        })}
      </span>
    );
  }

  return (
    <button
      ref={handleRef}
      type="button"
      aria-expanded={open}
      aria-haspopup="menu"
      aria-controls={
        open ? contentId : undefined
      }
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});

DropdownTrigger.displayName =
  "DropdownTrigger";

const widthClasses = {
  auto: "w-max min-w-36",
  sm: "w-48",
  md: "w-56",
  lg: "w-72",
};

function getDropdownPosition(
  trigger: HTMLElement | null,
  content: HTMLElement | null,
  options: {
    align: DropdownAlign;
    side: DropdownSide;
    sideOffset: number;
    width: "auto" | "sm" | "md" | "lg";
  },
) {
  if (!trigger || typeof window === "undefined") {
    return null;
  }

  const rect = trigger.getBoundingClientRect();
  const contentWidth =
    content?.offsetWidth ||
    (options.width === "auto" ? 160 : options.width === "md" ? 224 : options.width === "lg" ? 288 : 192);
  const contentHeight = content?.offsetHeight || 150;

  let targetLeft = rect.left;
  if (options.align === "end") {
    targetLeft = rect.right - contentWidth;
  } else if (options.align === "center") {
    targetLeft = rect.left + (rect.width - contentWidth) / 2;
  }

  const minLeft = 8;
  const maxLeft = Math.max(8, window.innerWidth - contentWidth - 8);
  const left = Math.min(Math.max(minLeft, targetLeft), maxLeft);

  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const isTop =
    options.side === "top"
      ? spaceAbove >= contentHeight + options.sideOffset || spaceAbove > spaceBelow
      : spaceBelow < contentHeight + options.sideOffset && spaceAbove > spaceBelow;

  const targetTop = isTop
    ? rect.top - contentHeight - options.sideOffset
    : rect.bottom + options.sideOffset;

  const minTop = 8;
  const maxTop = Math.max(8, window.innerHeight - contentHeight - 8);
  const top = Math.min(Math.max(minTop, targetTop), maxTop);

  return { top, left };
}

const DropdownContent = forwardRef<
  HTMLDivElement,
  DropdownContentProps
>(function DropdownContent(
  {
    children,
    className,
    align = "end",
    side = "bottom",
    sideOffset = 6,
    width = "sm",
    style,
    ...props
  },
  ref,
) {
  const {
    open,
    setOpen,
    contentId,
    triggerElement,
  } = useDropdownContext();

  const contentRef =
    useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<{ top: number; left: number } | null>(() =>
    getDropdownPosition(triggerElement, null, {
      align,
      side,
      sideOffset,
      width,
    }),
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (
      event: globalThis.MouseEvent | globalThis.TouchEvent,
    ) => {
      const target =
        event.target as Node;

      if (
        contentRef.current?.contains(target)
      ) {
        return;
      }

      if (
        triggerElement?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleKeyDown = (
      event: globalThis.KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );
    document.addEventListener(
      "touchstart",
      handlePointerDown,
    );
    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );
      document.removeEventListener(
        "touchstart",
        handlePointerDown,
      );
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, setOpen, triggerElement]);

  useEffect(() => {
    if (!open || !triggerElement) {
      return;
    }

    const handleUpdatePosition = () => {
      const rect = triggerElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setOpen(false);
        return;
      }

      const nextPos = getDropdownPosition(triggerElement, contentRef.current, {
        align,
        side,
        sideOffset,
        width,
      });

      if (nextPos) {
        setPosition(nextPos);
      }
    };

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && contentRef.current) {
      observer = new ResizeObserver(() => {
        handleUpdatePosition();
      });
      observer.observe(contentRef.current);
    }

    window.addEventListener("scroll", handleUpdatePosition, true);
    window.addEventListener("resize", handleUpdatePosition);

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", handleUpdatePosition, true);
      window.removeEventListener("resize", handleUpdatePosition);
    };
  }, [open, triggerElement, align, side, sideOffset, width, setOpen]);

  if (!open) {
    return null;
  }

  const mergedRef = (
    node: HTMLDivElement | null,
  ) => {
    contentRef.current = node;

    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const initialTop = (triggerElement?.getBoundingClientRect().bottom ?? -9999) + sideOffset;
  const initialLeft = (triggerElement?.getBoundingClientRect().left ?? -9999);

  const contentElement = (
    <div
      ref={mergedRef}
      id={contentId}
      role="menu"
      aria-orientation="vertical"
      className={cn(
        "fixed z-50",
        "min-w-36",
        "overflow-hidden",
        "rounded-lg",
        "border border-secondary-200/90 dark:border-[#323244]",
        "bg-white dark:bg-[#181822]",
        "p-1.5",
        "shadow-2xl ring-1 ring-black/10 dark:ring-white/10",
        "dark:text-white",
        "animate-in fade-in zoom-in-95 duration-100",
        widthClasses[width],
        className,
      )}
      style={{
        top: position?.top ?? initialTop,
        left: position?.left ?? initialLeft,
        visibility: position || triggerElement ? "visible" : "hidden",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(contentElement, document.body);
});

DropdownContent.displayName =
  "DropdownContent";

const DropdownItem = forwardRef<
  HTMLButtonElement,
  DropdownItemProps
>(function DropdownItem(
  {
    children,
    icon,
    variant = "default",
    destructive = false,
    closeOnSelect = true,
    className,
    onClick,
    disabled,
    ...props
  },
  ref,
) {
  const { setOpen } =
    useDropdownContext();

  const isDanger =
    destructive || variant === "danger";

  const handleClick = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    onClick?.(event);

    if (
      !event.defaultPrevented &&
      closeOnSelect
    ) {
      setOpen(false);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2",
        "rounded-md",
        "px-3 py-2",
        "text-left text-sm font-medium",
        "transition-colors",
        "outline-none",
        "disabled:pointer-events-none",
        "disabled:opacity-50",
        isDanger
          ? [
              "text-danger-600",
              "hover:bg-danger-50",
              "focus-visible:bg-danger-50",
            ]
          : [
              "text-secondary-700",
              "hover:bg-secondary-100",
              "focus-visible:bg-secondary-100",
            ],
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {icon && (
        <span
          className={cn(
            "grid size-4 shrink-0 place-items-center",
            isDanger
              ? "text-danger-500"
              : "text-secondary-500",
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      <span className="min-w-0 flex-1 truncate">
        {children}
      </span>
    </button>
  );
});

DropdownItem.displayName =
  "DropdownItem";

const DropdownLabel = forwardRef<
  HTMLDivElement,
  DropdownLabelProps
>(function DropdownLabel(
  {
    children,
    className,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "px-3 py-2",
        "text-xs font-semibold",
        "uppercase tracking-wide",
        "text-secondary-400",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

DropdownLabel.displayName =
  "DropdownLabel";

const DropdownSeparator = forwardRef<
  HTMLDivElement,
  DropdownSeparatorProps
>(function DropdownSeparator(
  {
    className,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      role="separator"
      className={cn(
        "my-1 h-px bg-border-subtle",
        className,
      )}
      {...props}
    />
  );
});

DropdownSeparator.displayName =
  "DropdownSeparator";

const DropdownGroup = forwardRef<
  HTMLDivElement,
  DropdownGroupProps
>(function DropdownGroup(
  {
    children,
    className,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
});

DropdownGroup.displayName =
  "DropdownGroup";

export const Dropdown =
  DropdownRoot as DropdownComponent;

Dropdown.Trigger =
  DropdownTrigger;

Dropdown.Content =
  DropdownContent;

Dropdown.Item =
  DropdownItem;

Dropdown.Label =
  DropdownLabel;

Dropdown.Separator =
  DropdownSeparator;

Dropdown.Group =
  DropdownGroup;

export {
  DropdownContent,
  DropdownTrigger,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownGroup,
};