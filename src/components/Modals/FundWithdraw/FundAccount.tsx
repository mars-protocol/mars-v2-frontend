import { useCallback, useEffect, useMemo, useState } from 'react'

import Button from 'components/Button'
import DepositCapMessage from 'components/DepositCapMessage'
import { ArrowRight, Plus } from 'components/Icons'
import SwitchAutoLend from 'components/Switch/SwitchAutoLend'
import Text from 'components/Text'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import WalletBridges from 'components/Wallet/WalletBridges'
import { BN_ZERO } from 'constants/math'
import useAutoLend from 'hooks/useAutoLend'
import useMarketAssets from 'hooks/useMarketAssets'
import useToggle from 'hooks/useToggle'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useWalletBalances from 'hooks/useWalletBalances'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getAssetByDenom, getBaseAsset } from 'utils/assets'
import { defaultFee } from 'utils/constants'
import { getCapLeftWithBuffer } from 'utils/generic'
import { BN } from 'utils/helpers'

interface Props {
  account: Account
}

export default function FundAccount(props: Props) {
  const { account } = props
  const accountId = account.id
  const address = useStore((s) => s.address)
  const deposit = useStore((s) => s.deposit)
  const walletAssetModal = useStore((s) => s.walletAssetsModal)
  const [isFunding, setIsFunding] = useToggle(false)
  const [fundingAssets, setFundingAssets] = useState<BNCoin[]>([])
  const { data: walletBalances } = useWalletBalances(address)
  const baseAsset = getBaseAsset()
  const hasAssetSelected = fundingAssets.length > 0
  const hasFundingAssets =
    fundingAssets.length > 0 && fundingAssets.every((a) => a.toCoin().amount !== '0')
  const { autoLendEnabledAccountIds } = useAutoLend()
  const isAutoLendEnabled = autoLendEnabledAccountIds.includes(accountId)
  const { simulateDeposits } = useUpdatedAccount(account)
  const { data: marketAssets } = useMarketAssets()
  const baseBalance = useMemo(
    () => walletBalances.find(byDenom(baseAsset.denom))?.amount ?? '0',
    [walletBalances, baseAsset],
  )

  const balances = walletBalances.map((coin) => new BNCoin(coin))

  const selectedDenoms = useMemo(() => {
    return walletAssetModal?.selectedDenoms ?? []
  }, [walletAssetModal?.selectedDenoms])

  const handleClick = useCallback(async () => {
    setIsFunding(true)
    if (!accountId) return
    const result = await deposit({
      accountId,
      coins: fundingAssets,
    })
    setIsFunding(false)
    if (result) useStore.setState({ fundAndWithdrawModal: null, walletAssetsModal: null })
  }, [fundingAssets, accountId, setIsFunding, deposit])

  const handleSelectAssetsClick = useCallback(() => {
    useStore.setState({
      walletAssetsModal: {
        isOpen: true,
        selectedDenoms,
        isBorrow: false,
      },
    })
  }, [selectedDenoms])

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

  const updateFundingAssets = useCallback((amount: BigNumber, denom: string) => {
    setFundingAssets((fundingAssets) => {
      const updateIdx = fundingAssets.findIndex(byDenom(denom))
      if (updateIdx === -1) return fundingAssets

      fundingAssets[updateIdx].amount = amount
      return [...fundingAssets]
    })
  }, [])

  useEffect(() => {
    simulateDeposits(isAutoLendEnabled ? 'lend' : 'deposit', fundingAssets)
  }, [isAutoLendEnabled, fundingAssets, simulateDeposits])

  useEffect(() => {
    if (BN(baseBalance).isLessThan(defaultFee.amount[0].amount)) {
      useStore.setState({ focusComponent: { component: <WalletBridges /> } })
    }
  }, [baseBalance])

  const depositCapReachedCoins = useMemo(() => {
    const depositCapReachedCoins: BNCoin[] = []
    fundingAssets.forEach((asset) => {
      const marketAsset = marketAssets.find(byDenom(asset.denom))
      if (!marketAsset) return

      const capLeft = getCapLeftWithBuffer(marketAsset.cap)

      if (asset.amount.isLessThanOrEqualTo(capLeft)) return

      depositCapReachedCoins.push(BNCoin.fromDenomAndBigNumber(asset.denom, capLeft))
    })
    return depositCapReachedCoins
  }, [fundingAssets, marketAssets])

  return (
    <>
      <div className='flex flex-wrap items-start'>
        {!hasAssetSelected && <Text>Please select an asset.</Text>}
        {fundingAssets.map((coin) => {
          const asset = getAssetByDenom(coin.denom) as Asset

          const balance = balances.find(byDenom(coin.denom))?.amount ?? BN_ZERO
          return (
            <TokenInputWithSlider
              key={coin.denom}
              asset={asset}
              onChange={(amount) => updateFundingAssets(amount, asset.denom)}
              amount={coin.amount ?? BN_ZERO}
              max={balance}
              balances={balances}
              maxText='Max'
              disabled={isFunding}
              className='w-full mb-4'
            />
          )
        })}
        <Button
          className='w-full mt-4'
          text='Select assets'
          color='tertiary'
          rightIcon={<Plus />}
          iconClassName='w-3'
          onClick={handleSelectAssetsClick}
          disabled={isFunding}
        />
        <DepositCapMessage
          action='fund'
          coins={depositCapReachedCoins}
          className='pr-4 py-2 mt-4'
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
        rightIcon={<ArrowRight />}
        disabled={!hasFundingAssets || depositCapReachedCoins.length > 0}
        showProgressIndicator={isFunding}
        onClick={handleClick}
      />
    </>
  )
}
