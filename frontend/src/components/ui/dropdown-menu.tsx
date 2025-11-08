import * as React from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null);

const DropdownMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ className, open: controlledOpen, onOpenChange, children, ...props }, ref) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open) {
        const target = event.target as HTMLElement;
        const isInsideContainer = containerRef.current?.contains(target);
        const isInsideContent = contentRef.current?.contains(target);
        const isButton = target.tagName === 'BUTTON' || target.closest('button');
        
        if (!isInsideContainer && !isInsideContent && !isButton) {
          setOpen(false);
        }
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open, setOpen]);

  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement, []);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, contentRef }}>
      <div ref={containerRef} className={cn('relative', className)} {...props}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
});
DropdownMenu.displayName = 'DropdownMenu';

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  }
>(({ className, onClick, asChild, children, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context.setOpen(!context.open);
    onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> };
    return React.cloneElement(children as React.ReactElement, {
      ...childProps,
      ref: ref as React.Ref<HTMLElement>,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        handleClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
        childProps?.onClick?.(e);
      },
      'aria-expanded': context.open,
      ...props,
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button
      ref={ref}
      className={cn('', className)}
      onClick={handleClick}
      aria-expanded={context.open}
      {...props}
    >
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: 'start' | 'end' | 'center';
  }
>(({ className, align = 'end', ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenuContent must be used within DropdownMenu');
  }

  if (!context.open) return null;

  const combinedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      context.contentRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref, context.contentRef]
  );

  return (
    <div
      ref={combinedRef}
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        align === 'end' && 'right-0',
        align === 'start' && 'left-0',
        align === 'center' && 'left-1/2 -translate-x-1/2',
        'mt-2',
        className
      )}
      {...props}
    />
  );
});
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('my-1 h-px bg-border', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};

