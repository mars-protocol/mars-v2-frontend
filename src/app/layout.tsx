import classNames from 'classnames'

import AccountDetails from 'components/Account/AccountDetails'
import Background from 'components/Background'
import FetchPrices from 'components/FetchPrices'
import DesktopHeader from 'components/Header/DesktopHeader'
import { Modals } from 'components/Modals'
import Toaster from 'components/Toaster'
import { headers } from 'next/headers'
import 'react-toastify/dist/ReactToastify.min.css'
import 'styles/globals.css'
import { getRouteParams } from 'utils/route'

export default function RootLayout(props: { children: React.ReactNode }) {
  const href = headers().get('x-url') || ''
  const params = getRouteParams(href)
  return (
    <html className='m-0 p-0' lang='en'>
      <head />
      <body className='m-0 cursor-default bg-body p-0 font-sans text-white'>
        <Background />
        <DesktopHeader params={params} />
        <FetchPrices />
        <main
          className={classNames(
            'relative flex justify-center py-6',
            'lg:mt-[65px] lg:h-[calc(100vh-65px)]',
          )}
        >
          <div className='flex max-w-content flex-grow flex-col flex-wrap'>{props.children}</div>
          <AccountDetails />
        </main>
        <Modals />
        <Toaster />
      </body>
    </html>
  )
}
