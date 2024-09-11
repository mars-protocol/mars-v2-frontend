import { BrowserRouter } from 'react-router-dom'

import Routes from 'components/header/navigation/Routes'
import { WalletConnectProvider } from 'components/Wallet/WalletConnectProvider'

export default function Router() {
  return (
    <WalletConnectProvider>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </WalletConnectProvider>
  )
}
