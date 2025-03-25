import { Analytics } from '@vercel/analytics/react'
import classNames from 'classnames'
import ModalsContainer from 'components/Modals/ModalsContainer'
import AccountDetails from 'components/account/AccountDetails'
import Background from 'components/common/Background'
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
import useChainConfig from 'hooks/chain/useChainConfig'
import useCurrentChainId from 'hooks/localStorage/useCurrentChainId'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { useSkipBridgeStatus } from 'hooks/localStorage/useSkipBridgeStatus'
import useGasPrices from 'hooks/prices/useGasPrices'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import { Suspense, useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { useLocation } from 'react-router-dom'
import useStore from 'store'
import { SWRConfig } from 'swr'
import { debugSWR } from 'utils/middleware'
import SkipBridgeModal from 'components/Modals/SkipBridgeModal'
import { BN } from 'utils/helpers'
import { NetworkCurrency } from '@delphi-labs/shuttle'
import useAssets from 'hooks/assets/useAssets'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'

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
  const { shouldShowSkipBridgeModal } = useSkipBridgeStatus()
  const { data: gasPricesData } = useGasPrices()
  const { data: walletBalances = [] } = useWalletBalances(address)
  const { data: assets } = useAssets()

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

  useEffect(() => {
    if (!gasPricesData || !walletBalances.length || !assets) return

    const getBestFeeTokenByGasPrice = () => {
      if (chainConfig.isOsmosis) {
        const nativeAsset = assets?.find((asset) => asset.denom === 'uosmo')
        return {
          coinDenom: 'OSMO',
          coinMinimalDenom: 'uosmo',
          coinDecimals: nativeAsset?.decimals || 6,
        }
      }

      const nativeDenom = chainConfig.defaultCurrency.coinMinimalDenom
      const nativeBalance = walletBalances.find((coin) => coin.denom === nativeDenom)
      const nativeGasPrice = gasPricesData.prices.find((price) => price.denom === nativeDenom)
      const nativeAsset = assets?.find((asset) => asset.denom === nativeDenom)

      if (nativeBalance && BN(nativeBalance.amount).isGreaterThan(0) && nativeGasPrice) {
        return {
          coinDenom:
            nativeAsset?.symbol || (nativeDenom === 'untrn' ? 'NTRN' : nativeDenom.toUpperCase()),
          coinMinimalDenom: nativeDenom,
          coinDecimals: nativeAsset?.decimals || (nativeDenom === 'untrn' ? 6 : 18),
        }
      }

      const usdcDenom = chainConfig.stables[0]
      const usdcBalance = walletBalances.find((coin) => coin.denom === usdcDenom)
      const usdcAsset = assets?.find((asset) => asset.denom === usdcDenom)

      if (usdcBalance && BN(usdcBalance.amount).isGreaterThan(0)) {
        return {
          coinDenom: 'USDC',
          coinMinimalDenom: usdcDenom,
          coinDecimals: usdcAsset?.decimals || 6,
        }
      }

      return null
    }

    try {
      const savedToken = localStorage.getItem(LocalStorageKeys.MARS_FEE_TOKEN)
      if (savedToken) {
        const parsedToken = JSON.parse(savedToken) as NetworkCurrency
        const currentTokenBalance = walletBalances.find(
          (coin) => coin.denom === parsedToken.coinMinimalDenom,
        )

        if (!currentTokenBalance || BN(currentTokenBalance.amount).isLessThanOrEqualTo(0)) {
          const bestToken = getBestFeeTokenByGasPrice()
          if (bestToken) {
            localStorage.setItem(LocalStorageKeys.MARS_FEE_TOKEN, JSON.stringify(bestToken))
          }
        }
      } else {
        const bestToken = getBestFeeTokenByGasPrice()
        if (bestToken) {
          localStorage.setItem(LocalStorageKeys.MARS_FEE_TOKEN, JSON.stringify(bestToken))
        }
      }
    } catch (error) {
      console.error('Failed to update fee token:', error)
    }
  }, [chainConfig, gasPricesData, walletBalances, assets])

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
            <Background />
            <Header />
            {shouldShowSkipBridgeModal && <SkipBridgeModal />}
            <main
              className={classNames(
                'md:min-h-[calc(100dvh-81px)]',
                'mt-[73px]',
                'flex',
                'min-h-screen-full w-full relative',
                'gap-4 p-2 pb-20',
                'md:gap-6 md:px-4 md:py-6',
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
