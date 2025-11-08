"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("relative", className)} {...props}>
      {children}
    </div>
  )
}

function SelectValue({ placeholder, ...props }: { placeholder?: string; [key: string]: any }) {
  return <span {...props}>{placeholder}</span>
}

function SelectContent({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg", className)} {...props}>
      {children}
    </div>
  )
}

function SelectItem({ className, children, value, ...props }: React.ComponentProps<"option">) {
  return (
    <option value={value} className={cn("px-2 py-1.5 text-sm hover:bg-gray-100", className)} {...props}>
      {children}
    </option>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }

