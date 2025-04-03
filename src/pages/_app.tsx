import { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect, useState } from 'react'

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

  // if (isServer) return null

  // const defaultHead = (
  //   <Head>
  //     <meta key='robots' content='index,follow' name='robots' />
  //     <meta key='twitter:card' content='summary_large_image' name='twitter:card' />
  //     <meta key='twitter:site' content='@mars_protocol' name='twitter:site' />
  //     <meta key='twitter:creator' content='@mars_protocol' name='twitter:creator' />
  //     <meta
  //       key='og:description'
  //       property='og:description'
  //       content="Trade spot, margin and perps, lend, and earn on the Cosmos' most powerful credit protocol. Featuring cross-collateralization and a single liquidation point."
  //     />
  //     <meta
  //       key='twitter:description'
  //       name='twitter:description'
  //       content="Trade spot, margin and perps, lend, and earn on the Cosmos' most powerful credit protocol. Featuring cross-collateralization and a single liquidation point."
  //     />
  //     <meta
  //       key='description'
  //       name='description'
  //       content="Trade spot, margin and perps, lend, and earn on the Cosmos' most powerful credit protocol. Featuring cross-collateralization and a single liquidation point."
  //     />
  //     <meta key='og:url' content='https://app.marsprotocol.io' property='og:url' />
  //     <meta key='og:image' content='https://app.marsprotocol.io/banner.png' property='og:image' />
  //     <meta key='og:site_name' content='Mars Protocol' property='og:site_name' />
  //   </Head>
  // )

  return (
    <>
      {/* this doesnt override the metadata above with dynamic ones*/}
      {/* {!isServer && ( */}
      <div suppressHydrationWarning>
        {/* {defaultHead} */}
        {typeof window === 'undefined' ? null : <PageComponent {...pageProps} />}
      </div>
      {/* )} */}

      {/* this works but get hydration error and no document found because the SSR call is made and document is not available  */}
      {/* <div suppressHydrationWarning>
        {defaultHead}
        <PageComponent {...pageProps} />
      </div> */}
    </>
  )
}
