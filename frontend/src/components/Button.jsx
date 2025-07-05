import { cn } from "../../lib/utils"

const buttonVariants = {
  default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
  ghost: "text-gray-700 hover:bg-gray-100 focus:ring-blue-500",
  destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
}

const buttonSizes = {
  sm: "px-3 py-1.5 text-sm",
  default: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
}

export const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  disabled = false,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

  return (
    <button
      className={cn(baseClasses, buttonVariants[variant], buttonSizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
