import React from "react"
import clsx from "clsx"

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={clsx(
      // Base shape & layout
      "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-150 ease-in-out",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",

      // Default style: soft blue glass effect
      "bg-blue-600/90 text-white backdrop-blur-md shadow-sm hover:bg-blue-700 hover:shadow-md",
      "active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",

      // Allow variant overrides
      className,
    )}
    {...props}
  />
))
Button.displayName = "Button"


