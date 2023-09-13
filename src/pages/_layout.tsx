import classNames from 'classnames'
import { isMobile } from 'react-device-detect'
import { useLocation } from 'react-router-dom'

import AccountDetails from 'components/Account/AccountDetails'
import Background from 'components/Background'
import Footer from 'components/Footer'
import DesktopHeader from 'components/Header/DesktopHeader'
import ModalsContainer from 'components/Modals/ModalsContainer'
import PageMetadata from 'components/PageMetadata'
import Toaster from 'components/Toaster'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'

interface Props {
  focusComponent: FocusComponent | null
  children: React.ReactNode
  fullWidth: boolean
}

function PageContainer(props: Props) {
  if (isMobile) return props.children

  if (!props.focusComponent)
    return (
      <div className={classNames('mx-auto h-full w-full', !props.fullWidth && 'max-w-content')}>
        {props.children}
      </div>
    )

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
  const account = useCurrentAccount()

  return (
    <>
      <PageMetadata />
      <Background />
      <DesktopHeader />
      <main
        className={classNames(
          'lg:min-h-[calc(100vh-65px)]',
          'lg:mt-[65px]',
          'min-h-screen gap-6 px-4 py-6 w-full relative',
          'flex',
          account && 'pr-24',
          'justify-center',
          focusComponent && 'items-center',
          isMobile && 'items-start',
        )}
      >
        <PageContainer focusComponent={focusComponent} fullWidth={isFullWidth}>
          {children}
        </PageContainer>

        <AccountDetails />
      </main>
      <Footer />
      <ModalsContainer />
      <Toaster />
    </>
  )
}
