import classNames from 'classnames'

import AccountDetails from 'components/Account/AccountDetails'
import Background from 'components/Background'
import Footer from 'components/Footer'
import DesktopHeader from 'components/Header/DesktopHeader'
import ModalsContainer from 'components/Modals/ModalsContainer'
import PageMetadata from 'components/PageMetadata'
import Toaster from 'components/Toaster'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageMetadata />
      <Background />
      <DesktopHeader />
      <main
        className={classNames(
          'relative flex justify-center pt-6',
          'lg:mt-[65px] lg:h-[calc(100vh-89px)]',
        )}
      >
        <div className='flex w-full max-w-content flex-grow flex-wrap content-start'>
          {children}
        </div>
        <AccountDetails />
      </main>
      <Footer />
      <ModalsContainer />
      <Toaster />
    </>
  )
}
