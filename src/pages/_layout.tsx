import classNames from 'classnames'
import { useLocation } from 'react-router-dom'

import AccountDetails from 'components/Account/AccountDetails'
import Background from 'components/Background'
import Footer from 'components/Footer'
import DesktopHeader from 'components/Header/DesktopHeader'
import ModalsContainer from 'components/Modals/ModalsContainer'
import PageMetadata from 'components/PageMetadata'
import Toaster from 'components/Toaster'

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isFullWidth = location.pathname.includes('trade')

  return (
    <>
      <PageMetadata />
      <Background />
      <DesktopHeader />
      <main
        className={classNames(
          'lg:h-[calc(100vh-89px)]',
          'p-6 lg:mt-[65px]',
          'align-items-center grid h-full grid-cols-[auto_min-content] place-items-start gap-6',
        )}
      >
        {isFullWidth ? children : <div className='mx-auto w-full max-w-content'>{children}</div>}
        <AccountDetails />
      </main>
      <Footer />
      <ModalsContainer />
      <Toaster />
    </>
  )
}
