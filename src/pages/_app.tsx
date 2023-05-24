import { AppProps } from 'next/app'
import { useEffect, useState } from 'react'

import DefaultPageHead from 'components/DefaultPageHead'

import 'react-toastify/dist/ReactToastify.min.css'
import 'styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const PageComponent = Component as any
  const [isServer, setIsServer] = useState(true)
  useEffect(() => {
    setIsServer(false)
  }, [])
  if (isServer) return null

  return (
    <>
      <DefaultPageHead />
      <div suppressHydrationWarning>
        {typeof window === 'undefined' ? null : <PageComponent {...pageProps} />}
      </div>
    </>
  )
}
