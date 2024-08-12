import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import WalletBridges from 'components/Wallet/WalletBridges'
import AccountFundRow from 'components/account/AccountFund/AccountFundRow'
import Button from 'components/common/Button'
import DepositCapMessage from 'components/common/DepositCapMessage'
import { ArrowRight, Plus } from 'components/common/Icons'
import SwitchAutoLend from 'components/common/Switch/SwitchAutoLend'
import Text from 'components/common/Text'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useBaseAsset from 'hooks/assets/useBasetAsset'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import { Callout, CalloutType } from 'components/common/Callout'
import { useUSDCBalances } from 'hooks/assets/useUSDCBalances'
import { useFundingAssets } from 'hooks/assets/useFundingAssets'
import { useDepositCapCalculations } from 'hooks/markets/useDepositCapCalculations'
import { useWeb3WalletConnection } from 'hooks/wallet/useWeb3WalletConnections'

interface Props {
  account?: Account
  address: string
  accountId: string
  isFullPage?: boolean
}

export default function AccountFundContent(props: Props) {
  const deposit = useStore((s) => s.deposit)
  const walletAssetModal = useStore((s) => s.walletAssetsModal)
  const [isConfirming, setIsConfirming] = useState(false)
  const { autoLendEnabledAccountIds } = useAutoLend()
  const isLending = autoLendEnabledAccountIds.includes(props.accountId)
  const { data: walletBalances } = useWalletBalances(props.address)
  const { simulateDeposits } = useUpdatedAccount(props.account)
  const baseAsset = useBaseAsset()

  const { usdcBalances } = useUSDCBalances(walletBalances)
  const selectedDenoms = useMemo(() => {
    return walletAssetModal?.selectedDenoms ?? []
  }, [walletAssetModal?.selectedDenoms])
  const { fundingAssets, updateFundingAssets } = useFundingAssets(selectedDenoms)
  const { depositCapReachedCoins } = useDepositCapCalculations(fundingAssets)
  const { isConnected, handleConnectWallet, handleDisconnectWallet } =
    useWeb3WalletConnection(walletBalances)

  const hasAssetSelected = fundingAssets.length > 0
  const hasFundingAssets =
    fundingAssets.length > 0 && fundingAssets.every((a) => a.toCoin().amount !== '0')
  const balances = walletBalances.map((coin) => new BNCoin(coin))

  const baseBalance = useMemo(
    () => walletBalances.find(byDenom(baseAsset.denom))?.amount ?? '0',
    [walletBalances, baseAsset],
  )

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
    if (!props.accountId) return

    const depositObject = {
      accountId: props.accountId,
      coins: fundingAssets,
      lend: isLending,
    }

    if (props.isFullPage) {
      setIsConfirming(true)
      const result = await deposit(depositObject)
      setIsConfirming(false)
      if (result)
        useStore.setState({
          walletAssetsModal: null,
          focusComponent: null,
        })
    } else {
      deposit(depositObject)
      useStore.setState({ fundAndWithdrawModal: null, walletAssetsModal: null })
    }
  }, [props.accountId, deposit, fundingAssets, isLending, props.isFullPage])

  useEffect(() => {
    if (BN(baseBalance).isZero()) {
      useStore.setState({ focusComponent: { component: <WalletBridges /> } })
    }
  }, [baseBalance])

  const onDebounce = useCallback(() => {
    simulateDeposits(isLending ? 'lend' : 'deposit', fundingAssets)
  }, [isLending, fundingAssets, simulateDeposits])

  const combinedBalances = useMemo(() => {
    const usdcBNCoinBalances = usdcBalances.map((asset) => new BNCoin(asset))
    return [...balances, ...usdcBNCoinBalances]
  }, [balances, usdcBalances])

  function renderFundingAssets(
    fundingAssets: BNCoin[],
    combinedBalances: BNCoin[],
    isConfirming: boolean,
    updateFundingAssets: (amount: BigNumber, denom: string, chainName?: string) => void,
    onDebounce: () => void,
    isFullPage?: boolean,
  ) {
    return fundingAssets.map((coin, index) => (
      <div
        key={`${coin.denom}-${index}`}
        className={classNames(
          'w-full mb-4',
          isFullPage && 'w-full p-4 border rounded-base border-white/20 bg-white/5',
        )}
      >
        <AccountFundRow
          denom={coin.denom}
          balances={combinedBalances}
          amount={coin.amount}
          isConfirming={isConfirming}
          updateFundingAssets={updateFundingAssets}
          onDebounce={onDebounce}
          chainName={coin.chainName}
        />
      </div>
    ))
  }

  return (
    <>
      <div>
        {!hasAssetSelected && <Text>Please select an asset.</Text>}
        {renderFundingAssets(
          fundingAssets,
          combinedBalances,
          isConfirming,
          updateFundingAssets,
          onDebounce,
          props.isFullPage,
        )}
        <Button
          className='w-full mt-4'
          text='Select Assets'
          color='tertiary'
          rightIcon={<Plus />}
          iconClassName='w-3'
          onClick={handleSelectAssetsClick}
          disabled={isConfirming}
        />
        <div className='mt-4 border border-transparent border-t-white/10' />
        <Callout type={CalloutType.INFO} className='mt-4'>
          {isConnected
            ? 'Now that you have connected an EVM Wallet, please select the assets you want to deposit.'
            : 'You want to add USDC from an Ethereum L1 or L2 chain? Connect your EVM wallet by clicking the button below and enable the deposit of EVM based USDC.'}
        </Callout>
        <Button
          className='w-full mt-4'
          text={isConnected ? 'Disconnect EVM Wallet' : 'Connect EVM Wallet'}
          color='primary'
          onClick={isConnected ? handleDisconnectWallet : handleConnectWallet}
        />
        <DepositCapMessage
          action='fund'
          coins={depositCapReachedCoins}
          className='py-2 pr-4 mt-4'
          showIcon
        />
        <SwitchAutoLend
          className='pt-4 mt-4 border border-transparent border-t-white/10'
          accountId={props.accountId}
        />
      </div>
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
    </>
  )
}
