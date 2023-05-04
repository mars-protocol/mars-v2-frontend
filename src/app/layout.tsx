import classNames from 'classnames'
import { headers } from 'next/headers'

import AccountDetails from 'components/Account/AccountDetails'
import Background from 'components/Background'
import FetchPrices from 'components/FetchPrices'
import Footer from 'components/Footer'
import DesktopHeader from 'components/Header/DesktopHeader'
import { Modals } from 'components/Modals'
import Toaster from 'components/Toaster'
import 'react-toastify/dist/ReactToastify.min.css'
import 'styles/globals.css'
import { getRouteParams } from 'utils/route'

export default function RootLayout(props: { children: React.ReactNode }) {
  const href = headers().get('x-url') || ''
  const params = getRouteParams(href)
  return (
    <html className='p-0 m-0' lang='en'>
      <head />
      <body className='p-0 m-0 font-sans text-white cursor-default bg-body'>
        <Background />
        <DesktopHeader params={params} />
        <FetchPrices />
        <main
          className={classNames(
            'relative flex justify-center pt-6',
            'lg:mt-[65px] lg:h-[calc(100vh-89px)]',
          )}
        >
          <div className='flex flex-wrap content-start flex-grow max-w-content'>
            {props.children}
          </div>
          <AccountDetails />
        </main>
        <Footer />
        <Modals />
        <Toaster />
      </body>
    </html>
  )
}
