import classNames from 'classnames'
import { Suspense } from 'react'
import { isMobile } from 'react-device-detect'
import { useLocation } from 'react-router-dom'

import AccountDetails from 'components/Account/AccountDetails'
import Background from 'components/Background'
import Footer from 'components/Footer'
import DesktopHeader from 'components/Header/DesktopHeader'
import ModalsContainer from 'components/Modals/ModalsContainer'
import PageMetadata from 'components/PageMetadata'
import Toaster from 'components/Toaster'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAccountId from 'hooks/useAccountId'
import useLocalStorage from 'hooks/useLocalStorage'
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
  const address = useStore((s) => s.address)
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    DEFAULT_SETTINGS.reduceMotion,
  )

  const accountDetailsExpanded = useStore((s) => s.accountDetailsExpanded)
  const isFullWidth =
    location.pathname.includes('trade') ||
    location.pathname === '/' ||
    location.pathname.includes('perps')
  const accountId = useAccountId()

  return (
    <>
      <PageMetadata />
      <Background />
      <DesktopHeader />
      <main
        className={classNames(
          'lg:min-h-[calc(100dvh-73px)]',
          'lg:mt-[73px]',
          'flex',
          'min-h-screen gap-6 px-4 py-6 w-full relative',
          !focusComponent &&
            address &&
            isFullWidth &&
            accountId &&
            (accountDetailsExpanded ? 'pr-118' : 'pr-24'),
          !reduceMotion && isFullWidth && 'transition-all duration-300',
          'justify-center',
          focusComponent && 'items-center',
          isMobile && 'items-start',
        )}
      >
        <Suspense>
          <PageContainer focusComponent={focusComponent} fullWidth={isFullWidth}>
            {children}
          </PageContainer>
        </Suspense>
        <AccountDetails />
      </main>
      <Footer />
      <ModalsContainer />
      <Toaster />
    </>
  )
}
