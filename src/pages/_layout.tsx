import classNames from 'classnames'
import { useLocation } from 'react-router-dom'

import AccountDetails from 'components/Account/AccountDetails'
import Background from 'components/Background'
import Footer from 'components/Footer'
import DesktopHeader from 'components/Header/DesktopHeader'
import ModalsContainer from 'components/Modals/ModalsContainer'
import PageMetadata from 'components/PageMetadata'
import TermsOfService from 'components/TermsOfService'
import Toaster from 'components/Toaster'
import useStore from 'store'

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const showTermsOfService = useStore((s) => s.showTermsOfService)
  const isFullWidth = location.pathname.includes('trade') || location.pathname === '/'

  return (
    <>
      <PageMetadata />
      <Background />
      <DesktopHeader />
      <main
        className={classNames(
          'lg:h-[calc(100vh-89px)]',
          'lg:mt-[65px]',
          'align-items-center grid h-full min-h-[900px] grid-cols-[auto_min-content] place-items-start gap-6 p-6',
        )}
      >
        <div className={classNames('mx-auto h-full w-full', !isFullWidth && 'max-w-content')}>
          {showTermsOfService ? <TermsOfService /> : children}
        </div>
        <AccountDetails />
      </main>
      <Footer />
      <ModalsContainer />
      <Toaster />
    </>
  )
}
