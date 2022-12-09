import 'react-toastify/dist/ReactToastify.min.css'
import '../styles/globals.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ToastContainer, Zoom } from 'react-toastify'

import { Layout, Modals } from 'components'
import { WalletConnectProvider } from 'components/Wallet'

const queryClient = new QueryClient()

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Mars V2</title>
        <link rel='icon' href='/favicon.svg' />
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
            transition={Zoom}
          />
        </QueryClientProvider>
      </WalletConnectProvider>
    </>
  )
}

export default App
