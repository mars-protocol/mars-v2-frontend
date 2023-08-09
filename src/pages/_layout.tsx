import classNames from 'classnames'
import { isMobile } from 'react-device-detect'
import { useLocation } from 'react-router-dom'

import AccountDetails from 'components/Account/AccountDetails'
import Background from 'components/Background'
import Footer from 'components/Footer'
import DesktopHeader from 'components/Header/DesktopHeader'
import MobileSupport from 'components/MobileSupport'
import ModalsContainer from 'components/Modals/ModalsContainer'
import PageMetadata from 'components/PageMetadata'
import Toaster from 'components/Toaster'
import useStore from 'store'

interface Props {
  focusComponent: FocusComponent | null
  children: React.ReactNode
}

function MainContent(props: Props) {
  if (isMobile) return <MobileSupport />

  if (!props.focusComponent) return props.children

  return (
    <div className='relative flex items-center justify-center w-full h-full'>
      {props.focusComponent.component}
    </div>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const focusComponent = useStore((s) => s.focusComponent)
  const isFullWidth = location.pathname.includes('trade') || location.pathname === '/'

  return (
    <>
      <PageMetadata />
      <Background />
      <DesktopHeader />
      <main
        className={classNames(
          'lg:min-h-[calc(100vh-89px)]',
          'lg:mt-[65px]',
          'h-full min-h-[900px] gap-6 p-6 w-full',
          focusComponent
            ? 'flex items-center justify-center'
            : 'grid grid-cols-[auto_min-content] place-items-start',
        )}
      >
        <div className={classNames('mx-auto h-full w-full', !isFullWidth && 'max-w-content')}>
          <MainContent focusComponent={focusComponent}>{children}</MainContent>
        </div>
        <AccountDetails />
      </main>
      <Footer />
      <ModalsContainer />
      <Toaster />
    </>
  )
}
