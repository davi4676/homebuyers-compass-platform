'use client'

import { useState } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactNode
  id?: string
}

export default function Tooltip({ content, children, id }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const tipId = id ?? `tooltip-${Math.random().toString(36).slice(2)}`

  return (
    <span className="relative inline-flex">
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-describedby={visible ? tipId : undefined}
        className="cursor-help border-b border-dotted border-gray-500"
      >
        {children}
      </span>
      {visible && (
        <span
          id={tipId}
          role="tooltip"
          className="absolute left-1/2 bottom-full -translate-x-1/2 mb-1 px-2 py-1.5 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap max-w-[220px] sm:max-w-none z-50"
        >
          {content}
        </span>
      )}
    </span>
  )
}
