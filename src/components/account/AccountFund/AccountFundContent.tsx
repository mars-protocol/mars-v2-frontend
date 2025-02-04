import { RouteResponse } from '@skip-go/client'
import classNames from 'classnames'
import WalletBridges from 'components/Wallet/WalletBridges'
import AccountFundingAssets from 'components/account/AccountFund/AccountFundingAssets'
import EVMAccountSection from 'components/account/AccountFund/EVMAccountSection'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import DepositCapMessage from 'components/common/DepositCapMessage'
import { ArrowRight, Plus } from 'components/common/Icons'
import SwitchAutoLend from 'components/common/Switch/SwitchAutoLend'
import Text from 'components/common/Text'
import { BN_ZERO } from 'constants/math'
import useBaseAsset from 'hooks/assets/useBaseAsset'
import { useFundingAssets } from 'hooks/assets/useFundingAssets'
import { useUSDCBalances } from 'hooks/assets/useUSDCBalances'
import { BridgeInfo, useSkipBridge } from 'hooks/bridge/useSkipBridge'
import useChainConfig from 'hooks/chain/useChainConfig'
import useEnableAutoLendGlobal from 'hooks/localStorage/useEnableAutoLendGlobal'
import { useDepositCapCalculations } from 'hooks/markets/useDepositCapCalculations'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import { useWeb3WalletConnection } from 'hooks/wallet/useWeb3WalletConnections'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from 'store'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'
import { byDenom } from 'utils/array'
import { MINIMUM_USDC } from 'utils/constants'
import { chainNameToUSDCAttributes } from 'utils/fetchUSDCBalance'
import { BN } from 'utils/helpers'
import { getPage, getRoute } from 'utils/route'
import BridgeRouteVisualizer from './BridgeContent/BridgeRouteVisualizer'

interface Props {
  account?: Account
  address?: string
  accountId: string
  isFullPage?: boolean
  onConnectWallet: () => Promise<boolean>
  hasExistingAccount?: boolean
}

export default function AccountFundContent(props: Props) {
  const deposit = useStore((s) => s.deposit)
  const createAccount = useStore((s) => s.createAccount)

  const walletAssetModal = useStore((s) => s.walletAssetsModal)
  const [isConfirming, setIsConfirming] = useState(false)
  const [currentEVMAssetValue, setCurrentEVMAssetValue] = useState<BigNumber>(BN_ZERO)
  const [previousEVMAmount, setPreviousEVMAmount] = useState<BigNumber>(BN_ZERO)
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const [isAutoLendEnabledGlobal] = useEnableAutoLendGlobal()
  const { data: walletBalances } = useWalletBalances(props.address)
  const baseAsset = useBaseAsset()
  const cosmosAddress = useStore((s) => s.address)

  const { usdcBalances } = useUSDCBalances(walletBalances)
  const selectedDenoms = useMemo(() => {
    return (
      walletAssetModal?.selectedDenoms?.map((denom) => {
        const [baseDenom, chain] = denom.split(':')
        return chain ? `${baseDenom}:${chain}` : baseDenom
      }) ?? []
    )
  }, [walletAssetModal?.selectedDenoms])
  const { fundingAssets, updateFundingAssets, setFundingAssets } = useFundingAssets(selectedDenoms)
  const { depositCapReachedCoins } = useDepositCapCalculations(fundingAssets)
  const { isConnected, address: evmAddress, handleDisconnectWallet } = useWeb3WalletConnection()
  const hasAssetSelected = fundingAssets.length > 0
  const hasFundingAssets =
    fundingAssets.length > 0 && fundingAssets.every((a) => a.coin.amount.isGreaterThan(0))
  const balances = walletBalances.map((coin) => WrappedBNCoin.fromCoin(coin))
  const navigate = useNavigate()

  const baseBalance = useMemo(
    () => walletBalances.find(byDenom(baseAsset.denom))?.amount ?? '0',
    [walletBalances, baseAsset],
  )

  const chainConfig = useChainConfig()

  const [goFast, setGoFast] = useState(true)

  const [currentRoute, setCurrentRoute] = useState<RouteResponse | undefined>(undefined)
  const [routeError, setRouteError] = useState<string | null>(null)

  const [bridges, setBridges] = useState<BridgeInfo[]>([])

  const { isBridgeInProgress, handleSkipTransfer, fetchSkipRoute, fetchBridgeLogos } =
    useSkipBridge({
      chainConfig,
      cosmosAddress,
      evmAddress,
      goFast,
    })

  const [showMinimumUSDCValueOverlay, setShowMinimumUSDCValueOverlay] = useState(false)

  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const evmAsset = fundingAssets.find(
    (asset) => asset.chain && chainNameToUSDCAttributes[asset.chain],
  )

  const isEVMAssetLessThanMinimumUSDC = evmAsset?.coin.amount.isLessThan(MINIMUM_USDC)
  const updateEVMAssetValue = useCallback(() => {
    if (evmAsset) {
      setCurrentEVMAssetValue(evmAsset.coin.amount)
    } else {
      setCurrentEVMAssetValue(BN_ZERO)
    }
  }, [evmAsset])

  useEffect(() => {
    updateEVMAssetValue()
  }, [fundingAssets, updateEVMAssetValue])

  useEffect(() => {
    const evmAsset = fundingAssets.find(
      (asset) => asset.chain && chainNameToUSDCAttributes[asset.chain],
    )

    if (evmAsset && !evmAsset.coin.amount.isZero()) {
      setPreviousEVMAmount(evmAsset.coin.amount)
    }

    const amountToCheck = evmAsset ? evmAsset.coin.amount : previousEVMAmount

    setShowMinimumUSDCValueOverlay(
      evmAsset !== undefined && !amountToCheck.isZero() && amountToCheck.isLessThan(MINIMUM_USDC),
    )
  }, [previousEVMAmount, fundingAssets, currentEVMAssetValue, handleSkipTransfer])

  const fetchRouteForEVMAsset = useCallback(async () => {
    const evmAsset = fundingAssets.find(
      (asset) => asset.chain && chainNameToUSDCAttributes[asset.chain],
    )

    if (!evmAsset || evmAsset.coin.amount.isZero()) {
      setCurrentRoute(undefined)
      setRouteError(null)
      return
    }

    if (isLoadingRoute) return

    setIsLoadingRoute(true)
    setRouteError(null)
    try {
      const route = await fetchSkipRoute(evmAsset)
      const bridgeLogos = await fetchBridgeLogos({ chainIDs: route.chainIDs })
      setBridges(bridgeLogos)
      setCurrentRoute(route)
    } catch (error) {
      console.error('Failed to fetch route:', error)
      setCurrentRoute(undefined)
      if (error instanceof Error && error.message.includes('no routes found')) {
        setRouteError(
          'No available routes found for this transfer. Please try again later or choose a different asset.',
        )
      } else {
        setRouteError('Failed to fetch route. Please try again later.')
      }
    } finally {
      setIsLoadingRoute(false)
    }
  }, [fetchSkipRoute, fundingAssets, isLoadingRoute, fetchBridgeLogos])

  useEffect(() => {
    const timer = setTimeout(() => {
      const evmAsset = fundingAssets.find(
        (asset) => asset.chain && chainNameToUSDCAttributes[asset.chain],
      )

      if (evmAsset && !evmAsset.coin.amount.isZero() && !isEVMAssetLessThanMinimumUSDC) {
        fetchRouteForEVMAsset()
      }
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goFast, currentEVMAssetValue])

  const handleClick = useCallback(async () => {
    if (isConfirming) return

    setIsConfirming(true)
    try {
      const isNewAccount = !props.hasExistingAccount
      const shouldAutoLend = isNewAccount
        ? isAutoLendEnabledGlobal
        : isAutoLendEnabledForCurrentAccount

      const evmAssets = fundingAssets.filter(
        (asset) => asset.chain && chainNameToUSDCAttributes[asset.chain],
      )
      const nonEvmAssets = fundingAssets.filter(
        (asset) => !asset.chain || !chainNameToUSDCAttributes[asset.chain],
      )

      let accountId = props.accountId
      if (isNewAccount) {
        const mintResult = await createAccount('default', shouldAutoLend)

        if (!mintResult) {
          throw new Error('Failed to create credit account')
        }
        accountId = mintResult
        useStore.setState((state) => ({ ...state, selectedAccountId: accountId }))
      }

      if (nonEvmAssets.length > 0) {
        const depositObject = {
          coins: nonEvmAssets.map((wrappedCoin) => wrappedCoin.coin),
          lend: shouldAutoLend,
          isAutoLend: shouldAutoLend,
          accountId,
        }

        await deposit(depositObject)
      }

      for (const evmAsset of evmAssets) {
        if (isBridgeInProgress) continue

        const success = await handleSkipTransfer(evmAsset, MINIMUM_USDC)
        if (!success) {
          setShowMinimumUSDCValueOverlay(true)
          break
        }
      }

      const { pathname } = window.location
      const searchParams = new URLSearchParams(window.location.search)
      navigate(getRoute(getPage(pathname, chainConfig), searchParams, props.address, accountId))

      if (props.isFullPage) {
        useStore.setState((state) => ({
          ...state,
          walletAssetsModal: null,
          focusComponent: null,
        }))
      } else {
        useStore.setState((state) => ({
          ...state,
          fundAndWithdrawModal: null,
          walletAssetsModal: null,
        }))
      }
    } catch (error) {
      console.error('Transaction failed:', error)
    } finally {
      setIsConfirming(false)
    }
  }, [
    props.accountId,
    props.address,
    props.isFullPage,
    props.hasExistingAccount,
    deposit,
    fundingAssets,
    isAutoLendEnabledForCurrentAccount,
    isAutoLendEnabledGlobal,
    navigate,
    handleSkipTransfer,
    chainConfig,
    isBridgeInProgress,
    isConfirming,
    createAccount,
  ])

  useEffect(() => {
    if (BN(baseBalance).isZero()) {
      useStore.setState({ focusComponent: { component: <WalletBridges /> } })
    }
  }, [baseBalance])

  useEffect(() => {
    if (!isConnected) {
      setFundingAssets((prevAssets) => prevAssets.filter((asset) => !asset.chain))
    }
  }, [isConnected, setFundingAssets])

  const combinedBalances = useMemo(() => {
    if (!isConnected) {
      return balances
    }
    return [...balances, ...usdcBalances]
  }, [balances, usdcBalances, isConnected])

  return (
    <>
      <div>
        {!hasAssetSelected && <Text>Please select an asset.</Text>}
        <AccountFundingAssets
          fundingAssets={fundingAssets}
          combinedBalances={combinedBalances}
          isConfirming={isConfirming}
          updateFundingAssets={updateFundingAssets}
          isFullPage={props.isFullPage}
          onChange={updateEVMAssetValue}
          routeResponse={currentRoute}
        />
        {!isEVMAssetLessThanMinimumUSDC && routeError && (
          <Callout type={CalloutType.WARNING} className='mt-4'>
            {routeError}
          </Callout>
        )}
        {showMinimumUSDCValueOverlay && (
          <Callout type={CalloutType.WARNING} className='mt-4'>
            You need to deposit at least 0.05 USDC, when bridging from an EVM chain.
          </Callout>
        )}
        <Button
          className='w-full mt-4'
          text='Select Assets'
          color='tertiary'
          rightIcon={<Plus />}
          iconClassName='w-3'
          onClick={() => {
            useStore.setState({
              walletAssetsModal: {
                isOpen: true,
                selectedDenoms,
                isBorrow: false,
              },
            })
          }}
          disabled={isConfirming}
        />
        {chainConfig.evmAssetSupport && (
          <>
            <EVMAccountSection
              isConnected={isConnected}
              isConfirming={isConfirming}
              handleConnectWallet={props.onConnectWallet}
              handleDisconnectWallet={handleDisconnectWallet}
              hasEVMAssetSelected={evmAsset !== undefined}
            />
            {currentRoute && (
              <div className='flex flex-col pt-4 mt-4 border-t border-white/10'>
                <div className='flex flex-row justify-between items-center gap-2'>
                  <Text className='mr-2 text-white/70' size='sm'>
                    Route Preference
                  </Text>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => setGoFast(true)}
                      className={classNames(
                        'flex-1 px-4 py-2 rounded text-sm transition-colors duration-200',
                        goFast
                          ? 'bg-white/10 text-white'
                          : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5',
                      )}
                    >
                      Fastest
                    </button>
                    <button
                      onClick={() => setGoFast(false)}
                      className={classNames(
                        'flex-1 px-4 py-2 rounded text-sm transition-colors duration-200',
                        !goFast
                          ? 'bg-white/10 text-white'
                          : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5',
                      )}
                    >
                      Cheapest
                    </button>
                  </div>
                </div>

                <div className='mt-4 flex flex-row justify-between gap-2'>
                  <Text className='mr-2 text-white/70' size='sm'>
                    Route
                  </Text>
                  <BridgeRouteVisualizer
                    isLoading={isLoadingRoute}
                    bridges={bridges}
                    originChain={fundingAssets.find((asset) => asset.chain)?.chain || ''}
                  />
                </div>
              </div>
            )}
            <DepositCapMessage
              action='fund'
              coins={depositCapReachedCoins}
              className='py-2 pr-4 mt-4'
              showIcon
            />
          </>
        )}
        <SwitchAutoLend
          className='pt-4 mt-4 border border-transparent border-t-white/10'
          accountId={props.accountId}
          isNewAccount={!props.hasExistingAccount}
        />
        <Button
          className='w-full mt-4'
          text='Fund account'
          disabled={
            !hasFundingAssets ||
            depositCapReachedCoins.length > 0 ||
            isBridgeInProgress ||
            showMinimumUSDCValueOverlay
          }
          showProgressIndicator={isConfirming}
          onClick={handleClick}
          color={props.isFullPage ? 'tertiary' : undefined}
          size={props.isFullPage ? 'lg' : undefined}
          rightIcon={props.isFullPage ? undefined : <ArrowRight />}
        />
      </div>
    </>
  )
}
