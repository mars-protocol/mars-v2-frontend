import classNames from 'classnames'
import { Suspense, useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { useLocation } from 'react-router-dom'
import { SWRConfig } from 'swr'

import ModalsContainer from 'components/Modals/ModalsContainer'
import AccountDetails from 'components/account/AccountDetails'
import Background from 'components/common/Background'
import Footer from 'components/common/Footer'
import PageMetadata from 'components/common/PageMetadata'
import Toaster from 'components/common/Toaster'
import Header from 'components/header/Header'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAccountId from 'hooks/accounts/useAccountId'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'
import { debugSWR } from 'utils/middleware'

interface Props {
  focusComponent: FocusComponent | null
  children: React.ReactNode
  fullWidth: boolean
}

function PageContainer(props: Props) {
  const isV1 = useStore((s) => s.isV1)

  if (!props.focusComponent)
    return (
      <div
        className={classNames(
          'mx-auto flex items-start w-full max-w-screen-full ',
          !props.fullWidth && !isV1 && 'md:max-w-content',
          isV1 && 'md:max-w-v1',
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
  const mobileNavExpanded = useStore((s) => s.mobileNavExpanded)
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

  useEffect(() => {
    if (!window) return
    const theme = localStorage.getItem(LocalStorageKeys.THEME) ?? 'default'
    const root = window.document.documentElement
    root.setAttribute('data-theme', theme)
  }, [])

  return (
    <>
      <SWRConfig value={{ use: [debugSWR] }}>
        <PageMetadata />
        <Background />
        <Header />
        <main
          className={classNames(
            'md:min-h-[calc(100dvh-81px)]',
            'mt-[73px]',
            'flex',
            'min-h-screen-full w-full relative',
            'gap-4 p-2 pb-20',
            'md:gap-6 md:px-4 md:py-6 ',
            !focusComponent &&
              address &&
              isFullWidth &&
              accountId &&
              (accountDetailsExpanded && !isMobile ? 'md:pr-102' : 'md:pr-24'),
            !reduceMotion && isFullWidth && 'transition-all duration-500',
            'justify-center',
            focusComponent && 'items-center',
            isMobile && 'items-start transition-all duration-500',
            mobileNavExpanded && isMobile && '-ml-full',
          )}
        >
          <Suspense>
            <PageContainer focusComponent={focusComponent} fullWidth={isFullWidth}>
              {children}
            </PageContainer>
          </Suspense>
          {!isMobile && <AccountDetails className='hidden md:flex' />}
        </main>
        <Footer />
        <ModalsContainer />
        <Toaster />
      </SWRConfig>
    </>
  )
}
