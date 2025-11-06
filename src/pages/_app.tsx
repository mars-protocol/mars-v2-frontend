import { AppProps } from 'next/app'
import { useEffect, useState } from 'react'

import { setApiOptions } from '@skip-go/client'
import init from 'utils/health_computer'

import 'styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'

export default function App({ Component, pageProps }: AppProps) {
  const PageComponent = Component as any
  const [isServer, setIsServer] = useState(true)

  useEffect(() => {
    setApiOptions({
      apiUrl: 'https://api.skip.build',
    })
  }, [])

  useEffect(() => {
    const loadHealthComputerWasm = async () => {
      await init()
    }
    loadHealthComputerWasm()
  }, [])

  useEffect(() => {
    setIsServer(false)
  }, [])

  if (isServer) return null

  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : <PageComponent {...pageProps} />}
    </div>
  )
}
