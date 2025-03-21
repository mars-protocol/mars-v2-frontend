import { AppProps } from 'next/app'
import { useEffect, useState } from 'react'

import DefaultPageHead from 'components/common/DefaultPageHead'
import init from 'utils/health_computer'

import 'react-toastify/dist/ReactToastify.css'
import 'styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const PageComponent = Component as any
  const [isServer, setIsServer] = useState(true)

  useEffect(() => {
    const loadHealthComputerWasm = async () => {
      await init()
    }
    loadHealthComputerWasm()
  }, [])

  useEffect(() => {
    setIsServer(false)
  }, [])

  return (
    <>
      <DefaultPageHead />
      !isServer && (
      <div suppressHydrationWarning>
        {typeof window === 'undefined' ? null : <PageComponent {...pageProps} />}
      </div>
      )
    </>
  )
}
