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
import { SkipClient } from '@skip-go/client'
import { WalletClient } from 'viem'
import { CHAIN_NAMES, chainNameToViemChain, USDC_ADDRESSES } from 'utils/fetchUSDCBalance'
import { getWalletClient } from '@wagmi/core'
import { config } from 'config/ethereumConfig'

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

  const skipClient = useMemo(
    () =>
      new SkipClient({
        getCosmosSigner: async (chainID) => {
          const offlineSigner = window.keplr?.getOfflineSigner('neutron-1')
          if (!offlineSigner) throw new Error('Keplr not installed')
          return offlineSigner
        },
        getEVMSigner: async (chainID) => {
          const evmWalletClient = (await getWalletClient(config, {
            chainId: parseInt(chainID),
          })) as WalletClient

          if (!evmWalletClient) {
            throw new Error(`getEVMSigner error: no wallet client available for chain ${chainID}`)
          }

          return evmWalletClient as any
        },
      }),
    [],
  )

  const CHAIN_IDS = Object.fromEntries(Object.entries(CHAIN_NAMES).map(([id, name]) => [name, id]))

  const handleSkipTransfer = useCallback(async () => {
    if (!cosmosAddress || !evmAddress || fundingAssets.length === 0) {
      console.error('Missing required data for transfer')
      return
    }

    const selectedAsset = fundingAssets[0]

    try {
      if (!selectedAsset.chain) throw new Error('Chain not found for selected asset')

      const route = await skipClient.route({
        allowMultiTx: true,
        allowUnsafe: true,
        cumulativeAffiliateFeeBPS: '0',
        experimentalFeatures: ['hyperlane'],
        smartRelay: true,
        smartSwapOptions: {
          splitRoutes: true,
          evmSwaps: true,
        },
        sourceAssetDenom: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        sourceAssetChainID: '137',
        destAssetDenom: 'ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81',
        destAssetChainID: 'neutron-1',
        amountIn: selectedAsset.coin.amount.toString(),
      })

      console.log('Received route:', route)

      const userAddresses = route.requiredChainAddresses.map((chainID) => ({
        chainID,
        address: chainID === 'neutron-1' || chainID === 'osmosis-1' ? cosmosAddress : evmAddress,
      }))

      console.log('User addresses:', userAddresses)

      console.log('Executing route...')
      await skipClient.executeRoute({
        route,
        userAddresses,
        onTransactionCompleted: async (chainID, txHash, status) => {
          console.log('Transaction completed:', { chainID, txHash, status })
        },
      })
      console.log('Route execution completed')
    } catch (error) {
      console.error('Skip transfer failed:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
    }
  }, [cosmosAddress, evmAddress, fundingAssets, skipClient])

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
