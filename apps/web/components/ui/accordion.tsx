'use client';

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const AccordionContext = React.createContext<{
  value: string | undefined;
  onValueChange: (value: string) => void;
}>({ value: undefined, onValueChange: () => {} });

export function Accordion({ children, className, collapsible, type, ...props }: any) {
  const [value, setValue] = React.useState<string | undefined>(undefined);
  return (
    <AccordionContext.Provider value={{ value, onValueChange: (val) => setValue(v => v === val ? undefined : val) }}>
      <div className={cn("w-full", className)} {...props}>{children}</div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({ value, children, className }: any) {
  return (
    <div className={cn("border-b", className)} data-value={value}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { itemValue: value });
        }
        return child;
      })}
    </div>
  );
}

export function AccordionTrigger({ itemValue, children, className }: any) {
  const { value, onValueChange } = React.useContext(AccordionContext);
  const isOpen = value === itemValue;
  
  return (
    <button
      type="button"
      className={cn("flex w-full flex-1 items-center justify-between py-4 font-medium transition-all", className)}
      onClick={() => onValueChange(itemValue)}
      aria-expanded={isOpen}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
    </button>
  );
}

export function AccordionContent({ itemValue, children, className }: any) {
  const { value } = React.useContext(AccordionContext);
  const isOpen = value === itemValue;
  
  if (!isOpen) return null;
  return (
    <div className="overflow-hidden text-sm transition-all">
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </div>
  );
}
