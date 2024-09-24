import ErrorApiPage from 'pages/ErrorApiPage'
import ErrorLocalStoreResetPage from 'pages/ErrorLocalStoreResetPage'
import ErrorNodePage from 'pages/ErrorNodePage'
import React, { Component } from 'react'

interface Props {
  errorStore: ErrorStore
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch() {
    this.setState({ hasError: true })
  }

  componentDidMount() {
    const hasError = this.state.hasError
    const errorStore = this.props.errorStore
    if ((errorStore.apiError || errorStore.nodeError) && !hasError)
      this.setState({ hasError: true })
  }

  componentDidUpdate() {
    const hasError = this.state.hasError
    const errorStore = this.props.errorStore
    if ((errorStore.apiError || errorStore.nodeError) && !hasError)
      this.setState({ hasError: true })
  }

  render() {
    const hasError = this.state.hasError
    const errorStore = this.props.errorStore

    if (!hasError) return this.props.children
    if (errorStore.nodeError) return <ErrorNodePage />
    if (errorStore.apiError) return <ErrorApiPage />
    return <ErrorLocalStoreResetPage />
  }
}

export default ErrorBoundary
