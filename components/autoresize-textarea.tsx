"use client"

import { cn } from "@/lib/utils"
import React, { useRef, useEffect, type TextareaHTMLAttributes, forwardRef } from "react"

interface AutoResizeTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  value: string
  onChange: (value: string) => void
}

export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(({ className, value, onChange, ...props }, ref) => {
  const resizeTextarea = () => {
    const textarea = ref && "current" in ref ? ref.current : null;


    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }

  useEffect(() => {
      resizeTextarea();
  }, [value])

  return (
    <textarea
      {...props}
      value={value}
      ref={ref}
      rows={1}
      onChange={(e) => {
        onChange(e.target.value)
        resizeTextarea()
      }}
      className={cn("resize-none min-h-4 max-h-80", className)}
    />
  )
})
