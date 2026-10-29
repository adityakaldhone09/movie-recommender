import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-cinema-violet/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

    const variants = {
      primary:
        'bg-cinema-gradient text-white shadow-glow-violet hover:opacity-95 hover:shadow-lg',
      secondary:
        'bg-surface-elevated text-cinema-text hover:bg-surface-hover border border-surface-border hover:border-cinema-violet/40',
      ghost:
        'bg-transparent text-cinema-muted hover:text-white hover:bg-white/5',
      outline:
        'bg-transparent border border-surface-border text-cinema-text hover:border-cinema-violet hover:bg-cinema-violet/10',
      danger:
        'bg-rose-600/90 hover:bg-rose-600 text-white shadow-md hover:shadow-rose-500/20',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
      md: 'text-sm px-4 py-2 rounded-xl gap-2',
      lg: 'text-base px-6 py-3 rounded-xl gap-2.5 font-semibold',
      icon: 'p-2 rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

