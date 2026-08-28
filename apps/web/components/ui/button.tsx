import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'dark';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, isLoading, variant = 'primary', disabled, ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none select-none cursor-pointer h-[52px] px-8";
    
    const variants = {
      primary: "bg-brand-maroon hover:bg-brand-burgundy text-brand-cream border border-transparent shadow-sm",
      secondary: "bg-brand-sand hover:bg-brand-sand/80 text-brand-brown border border-transparent",
      outline: "bg-transparent border border-brand-maroon/20 hover:border-brand-maroon text-brand-maroon",
      dark: "bg-zinc-950 hover:bg-zinc-900 text-white border border-transparent",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
