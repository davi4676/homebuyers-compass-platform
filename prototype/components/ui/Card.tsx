'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { cardStyles, cn } from '@/lib/design-system'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  interactive?: boolean
  elevated?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      hover = false,
      interactive = false,
      elevated = false,
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6 md:p-8',
      lg: 'p-8 md:p-10',
    }

    return (
      <div
        ref={ref}
        className={cn(
          elevated ? cardStyles.elevated : cardStyles.base,
          hover && cardStyles.hover,
          interactive && cardStyles.interactive,
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
