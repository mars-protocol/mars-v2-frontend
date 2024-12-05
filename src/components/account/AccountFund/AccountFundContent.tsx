import { useCallback, useEffect, useMemo, useState } from 'react'
import WalletBridges from 'components/Wallet/WalletBridges'
import DepositCapMessage from 'components/common/DepositCapMessage'
import SwitchAutoLend from 'components/common/Switch/SwitchAutoLend'
import Text from 'components/common/Text'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useBaseAsset from 'hooks/assets/useBaseAsset'
import useMarkets from 'hooks/markets/useMarkets'
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
import { useNavigate } from 'react-router-dom'
import { getPage, getRoute } from 'utils/route'
import useEnableAutoLendGlobal from 'hooks/localStorage/useEnableAutoLendGlobal'

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
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const [isAutoLendEnabledGlobal] = useEnableAutoLendGlobal()
  const { data: walletBalances } = useWalletBalances(props.address)
  const baseAsset = useBaseAsset()

  const { usdcBalances } = useUSDCBalances(walletBalances)
  const selectedDenoms = useMemo(() => {
    return walletAssetModal?.selectedDenoms ?? []
  }, [walletAssetModal?.selectedDenoms])
  const { fundingAssets, updateFundingAssets, setFundingAssets } = useFundingAssets(selectedDenoms)
  const { depositCapReachedCoins } = useDepositCapCalculations(fundingAssets)
  const { isConnected, handleDisconnectWallet } = useWeb3WalletConnection()
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
    const isNewAccount = !props.hasExistingAccount
    const shouldAutoLend = isNewAccount
      ? isAutoLendEnabledGlobal
      : isAutoLendEnabledForCurrentAccount

    const depositObject = {
      coins: fundingAssets.map((wrappedCoin) => wrappedCoin.coin),
      lend: shouldAutoLend,
      isAutoLend: shouldAutoLend,
    }

    setIsConfirming(true)
    try {
      const accountId = props.accountId
        ? await deposit({ ...depositObject, accountId: props.accountId })
        : await deposit(depositObject)

      if (accountId) {
        useStore.setState((state) => ({ ...state, selectedAccountId: accountId }))

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
      }
    } catch (error) {
      console.error('Deposit failed:', error)
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
          isNewAccount={!props.hasExistingAccount}
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
      </div>
    </>
  )
}
