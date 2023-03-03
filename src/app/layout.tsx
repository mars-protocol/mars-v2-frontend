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
    <html className='m-0 p-0' lang='en'>
      <head />
      <body className='m-0 cursor-default bg-body p-0 font-sans text-white'>
        <WalletConnectProvider>
          <Background />
          <DesktopNavigation />
        </WalletConnectProvider>
        <FetchPrices />
        <FetchAccounts />
        <main
          className={classNames(
            'relative flex justify-center py-6',
            'lg:mt-[65px] lg:h-[calc(100vh-65px)]',
          )}
        >
          <div className='flex max-w-content flex-grow flex-col flex-wrap'>{children}</div>
          <AccountDetails />
        </main>
        <Modals />
        <Toaster />
      </body>
    </html>
  )
}
