import Background from 'components/Background'
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
          <main className='relative flex lg:min-h-[calc(100vh-120px)]'>
            <div className='flex flex-grow flex-col flex-wrap'>{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
