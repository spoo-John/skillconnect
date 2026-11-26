import { Component, type ErrorInfo, type ReactNode } from 'react'
import { NotFoundPage } from '../pages/NotFoundPage'

interface Props {
  children: ReactNode
  /** Changing this (e.g. the route path) clears the error so navigation recovers. */
  resetKey?: string
}

interface State {
  error: Error | null
}

/** Catches render errors so a broken page shows the error screen instead of a blank one. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error', error, info.componentStack)
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null })
  }

  render() {
    if (this.state.error) return <NotFoundPage variant="error" />
    return this.props.children
  }
}
