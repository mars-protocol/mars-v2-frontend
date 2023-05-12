import classNames from 'classnames'
import { AppProps } from 'next/app'
import { headers } from 'next/headers'
import { useEffect, useState } from 'react'

import AccountDetails from 'components/Account/AccountDetails'
import Background from 'components/Background'
import FetchPrices from 'components/FetchPrices'
import Footer from 'components/Footer'
import DesktopHeader from 'components/Header/DesktopHeader'
import ModalsContainer from 'components/Modals/ModalsContainer'
import Toaster from 'components/Toaster'
import 'react-toastify/dist/ReactToastify.min.css'
import 'styles/globals.css'

function App({ Component, pageProps }: AppProps) {
  const [isServer, setIsServer] = useState(true)
  useEffect(() => {
    setIsServer(false)
  }, [])
  if (isServer) return null

  return (
    <>
      <Background />
      <DesktopHeader params={{ address: '', accountId: '', page: '' }} />
      <main
        className={classNames(
          'relative flex justify-center pt-6',
          'lg:mt-[65px] lg:h-[calc(100vh-89px)]',
        )}
      >
        <div className='flex w-full max-w-content flex-grow flex-wrap content-start'>
          <div suppressHydrationWarning>
            {typeof window === 'undefined' ? null : <Component {...pageProps} />}
          </div>
        </div>
        <AccountDetails />
      </main>
      <Footer />
      <ModalsContainer />
      <Toaster />
    </>
  )
}

export default App
