import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import Button from 'components/Button'
import Card from 'components/Card'
import DepositCapMessage from 'components/DepositCapMessage'
import FullOverlayContent from 'components/FullOverlayContent'
import { Plus } from 'components/Icons'
import SwitchAutoLend from 'components/Switch/SwitchAutoLend'
import Text from 'components/Text'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import WalletBridges from 'components/Wallet/WalletBridges'
import { BN_ZERO } from 'constants/math'
import useAccounts from 'hooks/useAccounts'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useMarketAssets from 'hooks/useMarketAssets'
import useToggle from 'hooks/useToggle'
import useWalletBalances from 'hooks/useWalletBalances'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getAssetByDenom, getBaseAsset } from 'utils/assets'
import { defaultFee } from 'utils/constants'
import { getCapLeftWithBuffer } from 'utils/generic'
import { BN } from 'utils/helpers'

export default function AccountFund() {
  const address = useStore((s) => s.address)
  const deposit = useStore((s) => s.deposit)
  const walletAssetModal = useStore((s) => s.walletAssetsModal)
  const { accountId } = useParams()
  const { data: accounts } = useAccounts(address)
  const currentAccount = useCurrentAccount()
  const [isFunding, setIsFunding] = useToggle(false)
  const [selectedAccountId, setSelectedAccountId] = useState<null | string>(null)
  const [fundingAssets, setFundingAssets] = useState<BNCoin[]>([])
  const { data: walletBalances } = useWalletBalances(address)
  const baseAsset = getBaseAsset()
  const hasAssetSelected = fundingAssets.length > 0
  const hasFundingAssets =
    fundingAssets.length > 0 && fundingAssets.every((a) => a.toCoin().amount !== '0')
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
    if (result) useStore.setState({ focusComponent: null, walletAssetsModal: null })
  }, [fundingAssets, accountId, setIsFunding, deposit])

  const handleSelectAssetsClick = useCallback(() => {
    useStore.setState({
      walletAssetsModal: {
        isOpen: true,
        selectedDenoms,
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
    if (BN(baseBalance).isLessThan(defaultFee.amount[0].amount)) {
      useStore.setState({ focusComponent: { component: <WalletBridges /> } })
    }
  }, [baseBalance])

  useEffect(() => {
    if (accounts && !selectedAccountId && accountId)
      setSelectedAccountId(currentAccount?.id ?? accountId)
  }, [accounts, selectedAccountId, accountId, currentAccount])

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

  if (!selectedAccountId) return null

  return (
    <FullOverlayContent
      title={`Fund Credit Account #${selectedAccountId}`}
      copy='In order to start trading with this account, you need to deposit funds.'
      docs='fund'
    >
      <Card className='w-full p-6 bg-white/5'>
        {!hasAssetSelected && <Text>Please select an asset.</Text>}
        {fundingAssets.map((coin) => {
          const asset = getAssetByDenom(coin.denom) as Asset

          const balance = balances.find(byDenom(coin.denom))?.amount ?? BN_ZERO
          return (
            <div
              key={asset.symbol}
              className='w-full p-4 border rounded-base border-white/20 bg-white/5'
            >
              <TokenInputWithSlider
                asset={asset}
                onChange={(amount) => updateFundingAssets(amount, asset.denom)}
                amount={coin.amount ?? BN_ZERO}
                max={balance}
                balances={balances}
                maxText='Max'
                disabled={isFunding}
              />
            </div>
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
          accountId={selectedAccountId}
        />
        <Button
          className='w-full mt-4'
          text='Fund account'
          color='tertiary'
          disabled={!hasFundingAssets || depositCapReachedCoins.length > 0}
          showProgressIndicator={isFunding}
          onClick={handleClick}
          size='lg'
        />
      </Card>
    </FullOverlayContent>
  )
}