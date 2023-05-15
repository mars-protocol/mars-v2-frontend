import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { WalletConnectProvider } from 'components/Wallet/WalletConnectProvider'
import Routes from 'components/Routes'
import Layout from 'pages/_layout'

export default function Router() {
  return (
    <WalletConnectProvider>
      <BrowserRouter>
        <Layout>
          <Routes />
        </Layout>
      </BrowserRouter>
    </WalletConnectProvider>
  )
}
