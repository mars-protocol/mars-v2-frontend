import classNames from 'classnames'
import { Suspense } from 'react'
import { isMobile } from 'react-device-detect'
import { useLocation } from 'react-router-dom'
import { SWRConfig } from 'swr'

import ModalsContainer from 'components/Modals/ModalsContainer'
import AccountDetails from 'components/account/AccountDetails'
import Background from 'components/common/Background'
import Footer from 'components/common/Footer'
import PageMetadata from 'components/common/PageMetadata'
import Toaster from 'components/common/Toaster'
import DesktopHeader from 'components/header/DesktopHeader'
import V1DesktopHeader from 'components/header/V1DesktopHeader'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useAccountId from 'hooks/useAccountId'
import useStore from 'store'
import { debugSWR } from 'utils/middleware'

interface Props {
  focusComponent: FocusComponent | null
  children: React.ReactNode
  fullWidth: boolean
}

function PageContainer(props: Props) {
  const isV1 = useStore((s) => s.isV1)

  if (isMobile) return props.children

  if (!props.focusComponent)
    return (
      <div
        className={classNames(
          'mx-auto flex items-start w-full',
          !props.fullWidth && !isV1 && 'max-w-content',
          isV1 && 'max-w-v1',
        )}
      >
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
  const isV1 = useStore((s) => s.isV1)

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
      <SWRConfig value={{ use: [debugSWR] }}>
        <PageMetadata />
        <Background />
        {isV1 ? <V1DesktopHeader /> : <DesktopHeader />}
        <main
          className={classNames(
            'lg:min-h-[calc(100dvh-81px)]',
            'lg:mt-[73px]',
            'flex',
            'min-h-screen gap-6 px-4 py-6 w-full relative',
            !focusComponent &&
              address &&
              isFullWidth &&
              accountId &&
              (accountDetailsExpanded ? 'pr-102' : 'pr-24'),
            !reduceMotion && isFullWidth && 'transition-all duration-500',
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
      </SWRConfig>
    </>
  )
}
