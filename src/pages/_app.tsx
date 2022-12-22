import 'react-toastify/dist/ReactToastify.min.css'
import '../styles/globals.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ToastContainer, Zoom } from 'react-toastify'

import { Layout, Modals } from 'components'
import { WalletConnectProvider } from 'components/Wallet'
import { useAnimations } from 'hooks/data'

const queryClient = new QueryClient()

const App = ({ Component, pageProps }: AppProps) => {
  const animations = useAnimations()

  return (
    <>
      <Head>
        <title>Mars Protocol V2</title>
        <meta charSet='utf-8' />
        <link href='/favicon.svg' rel='icon' />
        <link href='/apple-touch-icon.png' rel='apple-touch-icon' sizes='180x180' />
        <link href='/site.webmanifest' rel='manifest' />
        <link color='#dd5b65' href='/safari-pinned-tab.svg' rel='mask-icon' />
        <meta content='index,follow' name='robots' />
        <meta
          content="Lend, borrow and earn on the galaxy's most powerful credit protocol or enter the Fields of Mars for advanced DeFi strategies."
          name='description'
        />
        <meta content='summary_large_image' name='twitter:card' />
        <meta content='@mars_protocol' name='twitter:site' />
        <meta content='@mars_protocol' name='twitter:creator' />
        <meta content='https://osmosis.marsprotocol.io' property='og:url' />
        <meta content='Mars Protocol V2 - Powered by Osmosis' property='og:title' />
        <meta
          content="Lend, borrow and earn on the galaxy's most powerful credit protocol or enter the Fields of Mars for advanced DeFi strategies."
          property='og:description'
        />
        <meta content='https://osmosis.marsprotocol.io/banner.png' property='og:image' />
        <meta content='Mars Protocol V2' property='og:site_name' />
        <meta content='#ffffff' name='msapplication-TileColor' />
        <meta content='#ffffff' name='theme-color' />
      </Head>
      <WalletConnectProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <Layout>
            <Component {...pageProps} />
          </Layout>
          <Modals />
          <ToastContainer
            autoClose={1500}
            closeButton={false}
            position='bottom-right'
            hideProgressBar
            newestOnTop
            transition={animations ? Zoom : undefined}
          />
        </QueryClientProvider>
      </WalletConnectProvider>
    </>
  )
}

export default App
