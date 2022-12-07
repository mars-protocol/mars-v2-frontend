import 'react-toastify/dist/ReactToastify.min.css'
import '../styles/globals.css'

import detectEthereumProvider from '@metamask/detect-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import { ToastContainer, Zoom } from 'react-toastify'

import Layout from 'components/Layout'
import WalletConnectProvider from 'components/Wallet/WalletConnectProvider'
import { useWalletStore } from 'stores'

async function isMetamaskInstalled(): Promise<boolean> {
  const provider = await detectEthereumProvider()

  return !!provider
}

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }: AppProps) {
  const actions = useWalletStore((s) => s.actions)

  // init store
  useEffect(() => {
    const verifyMetamask = async () => {
      actions.setMetamaskInstalledStatus(await isMetamaskInstalled())
    }

    actions.initialize()

    verifyMetamask()
  }, [actions])

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

export default MyApp
