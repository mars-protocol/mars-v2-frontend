import { Analytics } from '@vercel/analytics/react'
import classNames from 'classnames'
import ModalsContainer from 'components/Modals/ModalsContainer'
import SkipBridgeModal from 'components/Modals/SkipBridgeModal'
import AccountDetails from 'components/account/AccountDetails'
import { CircularProgress } from 'components/common/CircularProgress'
import Footer from 'components/common/Footer'
import PageMetadata from 'components/common/PageMetadata'
import Text from 'components/common/Text'
import Toaster from 'components/common/Toaster'
import ErrorBoundary from 'components/error/ErrorBoundary'
import Header from 'components/header/Header'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAccountId from 'hooks/accounts/useAccountId'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useChainConfig from 'hooks/chain/useChainConfig'
import useCurrentChainId from 'hooks/localStorage/useCurrentChainId'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { useSkipBridgeStatus } from 'hooks/localStorage/useSkipBridgeStatus'
import { Suspense, useEffect, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { useLocation } from 'react-router-dom'
import useStore from 'store'
import { SWRConfig } from 'swr'
import { debugSWR } from 'utils/middleware'
import { getPage } from 'utils/route'

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
          'mx-auto flex items-start w-full md:h-full max-w-screen-full ',
          !props.fullWidth && !isV1 && 'md:max-w-content',
          isV1 && 'md:max-w-v1',
        )}
      >
        {props.children}
      </div>
    )

  return (
    <div className='relative flex items-center justify-center w-full h-full z-80'>
      {props.focusComponent.component}
    </div>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const focusComponent = useStore((s) => s.focusComponent)
  const mobileNavExpanded = useStore((s) => s.mobileNavExpanded)
  const errorStore = useStore((s) => s.errorStore)
  const address = useStore((s) => s.address)
  const [currentChainId, setCurrentChainId] = useCurrentChainId()
  const chainConfig = useChainConfig()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
  const accountDetailsExpanded = useStore((s) => s.accountDetailsExpanded)
  const isFullWidth =
    location.pathname.includes('trade') ||
    location.pathname === '/' ||
    (location.pathname.includes('perps') && !location.pathname.includes('perps-vault'))
  const accountId = useAccountId()
  const { data: accountIds } = useAccountIds(address)
  const hasCreditAccounts = !!accountIds?.length
  const { shouldShowSkipBridgeModal } = useSkipBridgeStatus()

  useEffect(() => {
    if (!window) return
    const theme =
      localStorage.getItem(LocalStorageKeys.THEME) ?? getDefaultChainSettings(chainConfig).theme
    const root = window.document.documentElement
    root.setAttribute('data-theme', theme)
  }, [chainConfig])

  useEffect(() => {
    if (currentChainId !== chainConfig.id) {
      setCurrentChainId(chainConfig.id)
    }
  }, [chainConfig.id, currentChainId, setCurrentChainId])

  const page = getPage(location.pathname, chainConfig)
  const [isHls, isV1, isVaults] = useMemo(
    () => [page.split('-')[0] === 'hls', page === 'v1', page.includes('vaults')],
    [page],
  )

  useEffect(() => {
    useStore.setState({ isHls, isV1, isVaults })
  }, [isHls, isV1, isVaults])

  return (
    <>
      <ErrorBoundary errorStore={errorStore}>
        <SWRConfig value={{ use: [debugSWR] }}>
          <Suspense
            fallback={
              <div className='flex items-center justify-center w-full h-screen-full'>
                <div className='flex flex-wrap justify-center w-full gap-4'>
                  <CircularProgress size={60} />
                  <Text className='w-full text-center' size='2xl'>
                    Fetching on-chain data...
                  </Text>
                </div>
              </div>
            }
          >
            <PageMetadata />
            <Header />
            {shouldShowSkipBridgeModal && <SkipBridgeModal />}
            <main
              className={classNames(
                'mt-18',
                'flex',
                'min-h-screen-full w-full relative',
                'md:h-[calc(100vh-72px)]',
                'pb-20 md:pb-0 p-2 md:p-0 md:pt-0.5',
                !focusComponent &&
                  address &&
                  isFullWidth &&
                  accountId &&
                  hasCreditAccounts &&
                  (accountDetailsExpanded && !isMobile ? 'md:pr-107' : 'md:pr-18'),
                !reduceMotion && isFullWidth && 'transition-all duration-500',
                'justify-center',
                focusComponent && 'items-center',
                isMobile && 'items-start transition-all duration-500',
                mobileNavExpanded && isMobile && '-ml-full',
              )}
            >
              <PageContainer focusComponent={focusComponent} fullWidth={isFullWidth}>
                {children}
              </PageContainer>
              {!isMobile && <AccountDetails className='hidden md:flex' />}
            </main>
            <Footer />

            <Analytics />
            <ModalsContainer />
            <Toaster />
          </Suspense>
        </SWRConfig>
      </ErrorBoundary>
    </>
  )
}
