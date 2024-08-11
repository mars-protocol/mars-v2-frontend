import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import WalletBridges from 'components/Wallet/WalletBridges'
import AccountFundRow from 'components/account/AccountFund/AccountFundRow'
import Button from 'components/common/Button'
import DepositCapMessage from 'components/common/DepositCapMessage'
import { ArrowRight, Plus } from 'components/common/Icons'
import SwitchAutoLend from 'components/common/Switch/SwitchAutoLend'
import Text from 'components/common/Text'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useBaseAsset from 'hooks/assets/useBasetAsset'
import useMarkets from 'hooks/markets/useMarkets'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getCapLeftWithBuffer } from 'utils/generic'
import { BN } from 'utils/helpers'
import { Callout, CalloutType } from 'components/common/Callout'
import { useWalletInfo, useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect } from 'wagmi'
import { CHAIN_NAMES, fetchUSDCBalances } from 'utils/fetchUSDCBalance'

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
  const [fundingAssets, setFundingAssets] = useState<BNCoin[]>([])
  const markets = useMarkets()
  const { data: walletBalances } = useWalletBalances(props.address)
  const { simulateDeposits } = useUpdatedAccount(props.account)
  const baseAsset = useBaseAsset()
  const [usdcBalances, setUsdcBalances] = useState<
    { denom: string; amount: string; chainName: string }[]
  >([])
  const { open } = useWeb3Modal()
  const { isConnecting, isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()

  const hasAssetSelected = fundingAssets.length > 0
  const hasFundingAssets =
    fundingAssets.length > 0 && fundingAssets.every((a) => a.toCoin().amount !== '0')
  const balances = walletBalances.map((coin) => new BNCoin(coin))
  const selectedDenoms = useMemo(() => {
    return walletAssetModal?.selectedDenoms ?? []
  }, [walletAssetModal?.selectedDenoms])

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
  const prevSelectedDenomsRef = useRef<string[]>([])

  useEffect(() => {
    if (JSON.stringify(prevSelectedDenomsRef.current) === JSON.stringify(selectedDenoms)) {
      return
    }

    const currentSelectedDenom = fundingAssets.map((asset) =>
      asset.chainName ? `${asset.denom}:${asset.chainName}` : asset.denom,
    )

    if (
      selectedDenoms.every((denom) => currentSelectedDenom.includes(denom)) &&
      selectedDenoms.length === currentSelectedDenom.length
    ) {
      return
    }

    const newFundingAssets = selectedDenoms.map((denomWithChain) => {
      const [denom, chainName] = denomWithChain.split(':')
      const effectiveChainName = chainName && chainName !== 'undefined' ? chainName : undefined

      return BNCoin.fromDenomAndBigNumber(denom, BN('0'), effectiveChainName)
    })

    setFundingAssets(newFundingAssets)

    prevSelectedDenomsRef.current = selectedDenoms
  }, [selectedDenoms, fundingAssets])

  const updateFundingAssets = useCallback(
    (amount: BigNumber, denom: string, chainName?: string) => {
      setFundingAssets((fundingAssets) => {
        const updateIdx = fundingAssets.findIndex(byDenom(denom))
        if (updateIdx === -1) return fundingAssets
        const updatedAsset = BNCoin.fromDenomAndBigNumber(denom, amount, chainName)
        return [
          ...fundingAssets.slice(0, updateIdx),
          updatedAsset,
          ...fundingAssets.slice(updateIdx + 1),
        ]
      })
    },
    [],
  )

  const onDebounce = useCallback(() => {
    simulateDeposits(isLending ? 'lend' : 'deposit', fundingAssets)
  }, [isLending, fundingAssets, simulateDeposits])

  const depositCapReachedCoins = useMemo(() => {
    const depositCapReachedCoins: BNCoin[] = []
    fundingAssets.forEach((asset) => {
      const marketAsset = markets.find((market) => market.asset.denom === asset.denom)
      if (!marketAsset || !marketAsset.cap) return

      const capLeft = getCapLeftWithBuffer(marketAsset.cap)

      if (asset.amount.isLessThanOrEqualTo(capLeft)) return

      depositCapReachedCoins.push(BNCoin.fromDenomAndBigNumber(asset.denom, capLeft))
    })
    return depositCapReachedCoins
  }, [fundingAssets, markets])

  const handleDisconnectWallet = useCallback(async () => {
    disconnect()
    useStore.setState({
      balances: walletBalances,
    })
  }, [disconnect, walletBalances])

  const handleConnectWallet = useCallback(async () => {
    await open()
  }, [open])

  useEffect(() => {
    const fetchBalances = async () => {
      if (isConnected && address && !isConnecting) {
        try {
          const balances = await fetchUSDCBalances(address)
          const usdcAssets = Object.entries(balances).map(([chainId, balance]) => ({
            denom: `ibc/4C19E7EC06C1AB2EC2D70C6855FEB6D48E9CE174913991DA0A517D21978E7E42`,
            amount: (Number(balance) * 10 ** 6).toString(),
            chainName: `${CHAIN_NAMES[Number(chainId)]}`,
          }))

          setUsdcBalances(usdcAssets)
          const combinedBalances = [
            ...walletBalances,
            ...usdcAssets.map((asset) => ({
              denom: asset.denom,
              amount: asset.amount,
              chainName: asset.chainName,
            })),
          ]
          useStore.setState({ balances: combinedBalances })
        } catch (error) {
          console.error('Error fetching USDC balances:', error)
        }
      }
    }

    fetchBalances()
  }, [address, isConnected, isConnecting, walletBalances])

  const combinedBalances = useMemo(() => {
    const usdcBNCoinBalances = usdcBalances.map((asset) => new BNCoin(asset))
    return [...balances, ...usdcBNCoinBalances]
  }, [balances, usdcBalances])

  return (
    <>
      <div>
        {!hasAssetSelected && <Text>Please select an asset.</Text>}
        {fundingAssets.map((coin, index) => {
          return (
            <div
              key={`${coin.denom}-${index}`}
              className={classNames(
                'w-full mb-4',
                props.isFullPage && 'w-full p-4 border rounded-base border-white/20 bg-white/5',
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
          )
        })}

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
