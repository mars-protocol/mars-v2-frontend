import Background from 'components/Background'
import DesktopNavigation from 'components/Navigation/DesktopNavigation'
import { WalletConnectProvider } from 'components/Wallet/WalletConnectProvider'
import 'react-toastify/dist/ReactToastify.min.css'
import 'styles/globals.css'

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
          <main className='relative flex lg:min-h-[calc(100vh-120px)]'>
            <div className='flex flex-grow flex-wrap p-6'>{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
