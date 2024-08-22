import { useCallback, useEffect, useMemo, useState } from 'react'
import WalletBridges from 'components/Wallet/WalletBridges'
import DepositCapMessage from 'components/common/DepositCapMessage'
import SwitchAutoLend from 'components/common/Switch/SwitchAutoLend'
import Text from 'components/common/Text'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useBaseAsset from 'hooks/assets/useBasetAsset'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import { useUSDCBalances } from 'hooks/assets/useUSDCBalances'
import { useFundingAssets } from 'hooks/assets/useFundingAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useDepositCapCalculations } from 'hooks/markets/useDepositCapCalculations'
import { useWeb3WalletConnection } from 'hooks/wallet/useWeb3WalletConnections'
import EVMAccountSection from './EVMAccountSection'
import AccountFundingAssets from './AccountFundingAssets'
import { ArrowRight, Plus } from 'components/common/Icons'
import Button from 'components/common/Button'
import getAccountIds from 'api/wallets/getAccountIds'
import { RecommendationEntry, SkipClient } from '@skip-go/client'
import { createWalletClient, custom, WalletClient } from 'viem'
import { CHAIN_NAMES, chainNameToViemChain, USDC_ADDRESSES } from 'utils/fetchUSDCBalance'

interface Props {
  account?: Account
  address?: string
  accountId: string
  isFullPage?: boolean
  onConnectWallet: () => Promise<void>
  hasExistingAccount?: boolean
}

export default function AccountFundContent(props: Props) {
  const deposit = useStore((s) => s.deposit)
  const walletAssetModal = useStore((s) => s.walletAssetsModal)
  const [isConfirming, setIsConfirming] = useState(false)
  const { autoLendEnabledAccountIds } = useAutoLend()
  const { data: walletBalances } = useWalletBalances(props.address)
  const { simulateDeposits } = useUpdatedAccount(props.account)
  const [isLending, setIsLending] = useState(autoLendEnabledAccountIds.includes(props.accountId))
  const baseAsset = useBaseAsset()

  const { usdcBalances } = useUSDCBalances(walletBalances)
  const selectedDenoms = useMemo(() => {
    return walletAssetModal?.selectedDenoms ?? []
  }, [walletAssetModal?.selectedDenoms])
  const { fundingAssets, updateFundingAssets, setFundingAssets } = useFundingAssets(selectedDenoms)
  const { depositCapReachedCoins } = useDepositCapCalculations(fundingAssets)
  const { isConnected, address: evmAddress, handleDisconnectWallet } = useWeb3WalletConnection()
  const cosmosAddress = useStore((s) => s.address)
  const [recommendedRoute, setRecommendedRoute] = useState<RecommendationEntry | null>(null)

  const { enableAutoLendForNewAccount } = useAutoLend()
  const hasAssetSelected = fundingAssets.length > 0
  const hasFundingAssets =
    fundingAssets.length > 0 && fundingAssets.every((a) => a.coin.amount.isGreaterThan(0))
  const balances = walletBalances.map((coin) => WrappedBNCoin.fromCoin(coin))

  const baseBalance = useMemo(
    () => walletBalances.find(byDenom(baseAsset.denom))?.amount ?? '0',
    [walletBalances, baseAsset],
  )

  const chainConfig = useChainConfig()

  const [skipClient] = useState(
    () =>
      new SkipClient({
        apiKey: process.env.NEXT_PUBLIC_SKIP_API_KEY,
        getCosmosSigner: async (chainID) => {
          const offlineSigner = window.keplr?.getOfflineSigner(chainID)
          if (!offlineSigner) throw new Error('Keplr not installed')
          return offlineSigner
        },
        getEVMSigner: async (chainName: string) => {
          const ethereum = window.ethereum
          if (!ethereum) throw new Error('MetaMask not installed')
          const client = createWalletClient({
            chain: chainNameToViemChain[chainName],
            transport: custom(ethereum),
          })
          return client as any
        },
      }),
  )

  const getRecommendedRoute = useCallback(
    async (selectedAsset: any) => {
      if (!selectedAsset.chain) return null

      const request = {
        sourceAssetDenom: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC
        sourceAssetChainID: '137',
        destChainID: 'neutron-1',
      }

      try {
        const recommendations = await skipClient.recommendAssets(request)
        return recommendations[0]
      } catch (error) {
        console.error('Failed to get recommended route:', error)
        return null
      }
    },
    [skipClient],
  )

  const CHAIN_IDS = Object.fromEntries(Object.entries(CHAIN_NAMES).map(([id, name]) => [name, id]))

  const handleSkipTransfer = useCallback(async () => {
    if (!cosmosAddress || !evmAddress || fundingAssets.length === 0) return

    const selectedAsset = fundingAssets[0]
    console.log(
      'routeProperties',
      selectedAsset.coin.amount.toString(),
      selectedAsset.coin.denom,
      chainConfig.id,
      selectedAsset.coin.amount.toString(),
      selectedAsset.coin.denom,
      'ethereum',
    )
    try {
      if (!selectedAsset.chain) throw new Error('Chain not found')

      const recommendation = await getRecommendedRoute(selectedAsset)
      setRecommendedRoute(recommendation)

      if (!recommendation) throw new Error('No recommended route found')

      const route = await skipClient.route({
        sourceAssetDenom: USDC_ADDRESSES[CHAIN_IDS[selectedAsset.chain]],
        sourceAssetChainID: CHAIN_IDS[selectedAsset.chain],
        destAssetDenom: chainConfig.defaultCurrency.coinMinimalDenom,
        destAssetChainID: chainConfig.id,
        amountIn: selectedAsset.coin.amount.toString(),
        cumulativeAffiliateFeeBPS: '0',
        allowUnsafe: true,
        experimentalFeatures: ['hyperlane'],
        allowMultiTx: true,
        smartRelay: true,
        smartSwapOptions: {
          splitRoutes: true,
          evmSwaps: true,
        },
      })
      const assets = await skipClient.assets({
        includeEvmAssets: true,
      })
      console.log('assets:', assets)

      const userAddresses = await Promise.all(
        route.requiredChainAddresses.map(async (chainID) => ({
          chainID,
          address: chainID === 'neutron-1' ? cosmosAddress : evmAddress,
        })),
      )

      await skipClient.executeRoute({
        route,
        userAddresses,
      })
    } catch (error) {
      console.error('Skip transfer failed:', error)
    }
  }, [
    cosmosAddress,
    evmAddress,
    fundingAssets,
    chainConfig,
    CHAIN_IDS,
    getRecommendedRoute,
    skipClient,
  ])

  const handleSelectAssetsClick = useCallback(() => {
    useStore.setState({
      walletAssetsModal: {
        isOpen: true,
        selectedDenoms,
        isBorrow: false,
      },
    })
  }, [selectedDenoms])

  const handleClick = useCallback(async () => {
    console.log('addresses', cosmosAddress, evmAddress)
    const depositObject = {
      coins: fundingAssets.map((wrappedCoin) => wrappedCoin.coin),
      lend: isLending,
    }

    setIsConfirming(true)
    let result
    if (props.accountId) {
      result = await deposit({ ...depositObject, accountId: props.accountId })
    } else {
      result = await deposit(depositObject)
      if (result) {
        const accountIds = await getAccountIds(chainConfig, props.address)
        if (accountIds.length > 0) {
          const latestAccountId = accountIds[accountIds.length - 1].id
          enableAutoLendForNewAccount(latestAccountId)
        }
      }
    }
    setIsConfirming(false)

    if (result) {
      if (props.isFullPage) {
        useStore.setState({
          walletAssetsModal: null,
          focusComponent: null,
        })
      } else {
        useStore.setState({ fundAndWithdrawModal: null, walletAssetsModal: null })
      }
    }
  }, [
    props.accountId,
    props.address,
    chainConfig,
    cosmosAddress,
    evmAddress,
    props.isFullPage,
    deposit,
    fundingAssets,
    isLending,
    enableAutoLendForNewAccount,
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
        />
        <Button
          className='w-full mt-4'
          text='Select Assets'
          color='tertiary'
          rightIcon={<Plus />}
          iconClassName='w-3'
          onClick={handleSelectAssetsClick}
          disabled={isConfirming}
        />
        {chainConfig.evmAssetSupport && (
          <>
            <EVMAccountSection
              isConnected={isConnected}
              isConfirming={isConfirming}
              handleConnectWallet={props.onConnectWallet}
              handleDisconnectWallet={handleDisconnectWallet}
            />
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
          isEnabled={isLending}
          onChange={setIsLending}
        />
        <Button
          className='w-full mt-4'
          text='Fund account'
          disabled={!hasFundingAssets || depositCapReachedCoins.length > 0}
          showProgressIndicator={isConfirming}
          onClick={handleClick}
          color={props.isFullPage ? 'tertiary' : undefined}
          size={props.isFullPage ? 'lg' : undefined}
          rightIcon={props.isFullPage ? undefined : <ArrowRight />}
        />
        <Button
          className='w-full mt-4'
          text='Transfer with Skip'
          disabled={!hasFundingAssets || isConfirming}
          showProgressIndicator={isConfirming}
          onClick={handleSkipTransfer}
          color='secondary'
        />
      </div>
    </>
  )
}
