import { cn } from "../../lib/utils"

export const Alert = ({ className = "", variant = "default", children, ...props }) => {
  const variants = {
    default: "bg-blue-50 border-blue-200 text-blue-800",
    destructive: "bg-red-50 border-red-200 text-red-800",
  }

  return (
    <div className={cn("relative w-full rounded-lg border p-4", variants[variant], className)} {...props}>
      {children}
    </div>
  )
}

export const AlertDescription = ({ className = "", children, ...props }) => {
  return (
    <div className={cn("text-sm", className)} {...props}>
      {children}
    </div>
  )
}
