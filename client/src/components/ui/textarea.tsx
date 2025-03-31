import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-[#7f5af0]/40 bg-[#1e1e2f] px-3 py-2 text-sm text-white ring-offset-[#1e1e2f] placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7f5af0]/80 focus-visible:ring-offset-2 focus-visible:border-[#7f5af0] hover:border-[#7f5af0]/60 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
