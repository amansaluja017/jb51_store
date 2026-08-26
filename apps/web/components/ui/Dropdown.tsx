'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  onDeleteOption?: (value: string) => void;
  placeholder?: string;
  labelPrefix?: string; // Optional prefix label, e.g. "Sort by:"
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  onDeleteOption,
  placeholder = "Select an option",
  labelPrefix,
  className,
  triggerClassName,
  menuClassName,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 border border-zinc-200 rounded-full px-4 py-2 bg-zinc-50 hover:bg-white text-xs font-semibold text-zinc-800 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-[#FF5E36]/30",
          isOpen && "border-zinc-300 bg-white shadow-sm",
          triggerClassName
        )}
      >
        <span className="truncate">
          {labelPrefix && (
            <span className="text-zinc-400 font-bold uppercase tracking-wider mr-1.5 text-[9px] md:text-[10px]">
              {labelPrefix}
            </span>
          )}
          <span className={cn(selectedOption ? 'text-zinc-950' : 'text-zinc-400 font-normal')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown 
          size={13} 
          className={cn("text-zinc-400 transition-transform duration-300 shrink-0", isOpen && "rotate-180 text-zinc-800")} 
        />
      </button>

      {isOpen && (
        <div 
          className={cn(
            "absolute right-0 mt-2 w-full min-w-[200px] bg-white border border-zinc-200/80 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden animate-scale-up origin-top-right",
            menuClassName
          )}
        >
          {options.map((option) => (
            <div
              key={option.value}
              className={cn(
                "w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium border-b border-zinc-50 last:border-0 hover:bg-zinc-50/70 group/item transition-colors",
                option.value === value && "bg-zinc-50"
              )}
            >
              <button
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex-1 text-left truncate py-1 text-xs transition-colors",
                  option.value === value 
                    ? "text-[#FF5E36] font-semibold" 
                    : "text-zinc-600 hover:text-zinc-950"
                )}
              >
                {option.label}
              </button>
              {onDeleteOption && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteOption(option.value);
                  }}
                  className="text-zinc-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors opacity-0 group-hover/item:opacity-100 focus:opacity-100 shrink-0"
                  title="Delete option"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
