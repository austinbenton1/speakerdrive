import * as React from "react"
import { cn } from "../../lib/utils"

const MinimalToggle = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label className="relative inline-block h-4 w-8">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            "peer sr-only",
            "[&:checked+span:before]:-translate-x-4",
            "[&:checked+span:before]:bg-white",
            "[&:checked+span]:bg-[#00B341]",
            className
          )}
          {...props}
        />
        <span className={cn(
          "absolute inset-0 cursor-pointer rounded-full bg-gray-300 transition-all duration-200",
          "before:absolute before:right-0.5 before:top-0.5 before:h-3 before:w-3",
          "before:rounded-full before:bg-white before:transition-all before:duration-200 before:content-['']",
          "before:shadow-sm"
        )} />
      </label>
    )
  }
)
MinimalToggle.displayName = "MinimalToggle"

const OrangeToggle = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "ease before:ease relative h-6 w-12 appearance-none rounded-full bg-stone-300",
          "transition duration-300",
          "before:absolute before:left-[calc(1.5em_-_1.6em)] before:top-[calc(1.5em_-_1.6em)]",
          "before:block before:h-[1.7em] before:w-[1.6em] before:cursor-pointer",
          "before:rounded-full before:border before:border-solid before:border-stone-400",
          "before:bg-white before:transition-all before:duration-300 before:content-['']",
          "checked:bg-orange-600 checked:before:translate-x-full checked:before:border-orange-500",
          "hover:before:shadow-[0_0_0px_8px_rgba(0,0,0,0.15)]",
          "checked:hover:before:shadow-[0_0_0px_8px_rgba(236,72,72,0.15)]",
          className
        )}
        {...props}
      />
    )
  }
)
OrangeToggle.displayName = "OrangeToggle"

export { MinimalToggle, OrangeToggle }