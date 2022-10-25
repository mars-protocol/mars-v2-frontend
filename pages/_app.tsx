import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ToastContainer, Zoom } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import detectEthereumProvider from '@metamask/detect-provider'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import '../styles/globals.css'
import Layout from 'components/Layout'
import useWalletStore from 'stores/useWalletStore'

async function isMetamaskInstalled(): Promise<boolean> {
  const provider = await detectEthereumProvider()

  return !!provider
}

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }: AppProps) {
  const address = useWalletStore((s) => s.address)
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
        {/* <meta name="description" content="Generated by create next app" /> */}
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <ToastContainer
          autoClose={1500}
          closeButton={false}
          position="bottom-right"
          hideProgressBar
          newestOnTop
          transition={Zoom}
        />
      </QueryClientProvider>
    </>
  )
}

export default MyApp
