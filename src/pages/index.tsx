import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { WalletConnectProvider } from 'components/Wallet/WalletConnectProvider'
import Routes from 'components/Routes'

export default function Router() {
  return (
    <WalletConnectProvider>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </WalletConnectProvider>
  )
}
