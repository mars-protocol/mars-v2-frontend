import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'

import WalletBridges from 'components/Wallet/WalletBridges'
import AccountFundRow from 'components/account/AccountFund/AccountFundRow'
import Button from 'components/common/Button'
import DepositCapMessage from 'components/common/DepositCapMessage'
import { ArrowRight, Plus } from 'components/common/Icons'
import SwitchAutoLend from 'components/common/Switch/SwitchAutoLend'
import Text from 'components/common/Text'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useBaseAsset from 'hooks/assets/useBaseAsset'
import useMarkets from 'hooks/markets/useMarkets'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getCapLeftWithBuffer } from 'utils/generic'
import { BN } from 'utils/helpers'

interface Props {
  account?: Account
  address: string
  accountId: string
  isFullPage?: boolean
}

export default function AccountFundContent(props: Props) {
  const { address, account, accountId, isFullPage } = props
  const deposit = useStore((s) => s.deposit)
  const walletAssetModal = useStore((s) => s.walletAssetsModal)
  const [isConfirming, setIsConfirming] = useState(false)
  const { autoLendEnabledAccountIds } = useAutoLend()
  const isLending = autoLendEnabledAccountIds.includes(accountId)
  const [fundingAssets, setFundingAssets] = useState<BNCoin[]>([])
  const markets = useMarkets()

  const { data: walletBalances } = useWalletBalances(address)
  const { simulateDeposits } = useUpdatedAccount(account)
  const baseAsset = useBaseAsset()

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
    if (!accountId) return

    const depositObject = {
      accountId: accountId,
      coins: fundingAssets,
      lend: isLending,
    }

    if (isFullPage) {
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
  }, [accountId, deposit, fundingAssets, isLending, isFullPage])

  useEffect(() => {
    if (BN(baseBalance).isZero()) {
      useStore.setState({ focusComponent: { component: <WalletBridges /> } })
    }
  }, [baseBalance])

  useEffect(() => {
    const currentSelectedDenom = fundingAssets.map((asset) => asset.denom)

    if (
      selectedDenoms.every((denom) => currentSelectedDenom.includes(denom)) &&
      selectedDenoms.length === currentSelectedDenom.length
    )
      return

    const newFundingAssets = selectedDenoms.map((denom) =>
      BNCoin.fromDenomAndBigNumber(denom, BN(fundingAssets.find(byDenom(denom))?.amount ?? '0')),
    )

    setFundingAssets(newFundingAssets)
  }, [selectedDenoms, fundingAssets])

  const updateFundingAssets = useCallback(
    (amount: BigNumber, denom: string) => {
      setFundingAssets((fundingAssets) => {
        const updateIdx = fundingAssets.findIndex(byDenom(denom))
        if (updateIdx === -1) return fundingAssets

        fundingAssets[updateIdx].amount = amount
        simulateDeposits(isLending ? 'lend' : 'deposit', fundingAssets)
        return [...fundingAssets]
      })
    },
    [isLending, simulateDeposits],
  )

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

  return (
    <>
      <div>
        {!hasAssetSelected && <Text>Please select an asset.</Text>}
        {fundingAssets.map((coin) => {
          return (
            <div
              key={coin.denom}
              className={classNames(
                'w-full mb-4',
                isFullPage && 'w-full p-4 border rounded-base border-white/20 bg-white/5',
              )}
            >
              <AccountFundRow
                denom={coin.denom}
                balances={balances}
                amount={coin.amount ?? BN_ZERO}
                isConfirming={isConfirming}
                updateFundingAssets={updateFundingAssets}
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
        <DepositCapMessage
          action='fund'
          coins={depositCapReachedCoins}
          className='py-2 pr-4 mt-4'
          showIcon
        />
        <SwitchAutoLend
          className='pt-4 mt-4 border border-transparent border-t-white/10'
          accountId={accountId}
        />
      </div>
      <Button
        className='w-full mt-4'
        text='Fund account'
        disabled={!hasFundingAssets || depositCapReachedCoins.length > 0}
        showProgressIndicator={isConfirming}
        onClick={handleClick}
        color={isFullPage ? 'tertiary' : undefined}
        size={isFullPage ? 'lg' : undefined}
        rightIcon={isFullPage ? undefined : <ArrowRight />}
      />
    </>
  )
}
