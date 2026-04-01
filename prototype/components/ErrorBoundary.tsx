'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback ?? (
        <div className="min-h-[200px] p-8 bg-[#0a0a0a] text-[#f5f5f5]">
          <p className="text-lg font-semibold text-red-400">Something went wrong.</p>
          <p className="mt-2 text-sm text-gray-400">{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
