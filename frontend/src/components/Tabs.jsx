"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export const Tabs = ({ defaultValue, children, className = "", ...props }) => {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <div className={cn("w-full", className)} {...props}>
      <TabsContext.Provider value={{ activeTab, setActiveTab }}>{children}</TabsContext.Provider>
    </div>
  )
}

export const TabsList = ({ className = "", children, ...props }) => {
  return (
    <div
      className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export const TabsTrigger = ({ value, className = "", children, ...props }) => {
  const { activeTab, setActiveTab } = useTabsContext()
  const isActive = activeTab === value

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900",
        className,
      )}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ value, className = "", children, ...props }) => {
  const { activeTab } = useTabsContext()

  if (activeTab !== value) return null

  return (
    <div className={cn("mt-2 focus:outline-none", className)} {...props}>
      {children}
    </div>
  )
}

// Context for tabs
import { createContext, useContext } from "react"

const TabsContext = createContext()

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs component")
  }
  return context
}
