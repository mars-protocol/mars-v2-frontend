import classNames from 'classnames'

import AccountDetails from 'components/Account/AccountDetails'
import Background from 'components/Background'
import FetchAccounts from 'components/FetchAccounts'
import FetchPrices from 'components/FetchPrices'
import { Modals } from 'components/Modals'
import DesktopNavigation from 'components/Navigation/DesktopNavigation'
import Toaster from 'components/Toaster'
import { WalletConnectProvider } from 'components/Wallet/WalletConnectProvider'
import 'react-toastify/dist/ReactToastify.min.css'
import 'styles/globals.scss'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head />

      <body>
        <div className='relative min-h-screen w-full'>
          <WalletConnectProvider>
            <Background />
            <DesktopNavigation />
          </WalletConnectProvider>
          <Modals />
          <Toaster />
          <FetchPrices />
          <FetchAccounts />
          <main
            className={classNames(
              'relative flex justify-center py-6',
              'lg:mt-[65px] lg:min-h-[calc(100vh-65px)]',
            )}
          >
            <div className='flex max-w-content flex-grow flex-col flex-wrap'>{children}</div>
            <AccountDetails />
          </main>
        </div>
      </body>
    </html>
  )
}
