import { useCallback, useEffect, useMemo, useState } from 'react'

import Divider from 'components/Divider'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { SLIPPAGE_KEY } from 'constants/localStore'
import { ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { hardcodedFee } from 'utils/constants'
import RangeInput from 'components/RangeInput'
import { BN } from 'utils/helpers'
import AssetAmountInput from 'components/Trade/TradeModule/SwapForm/AssetAmountInput'
import MarginToggle from 'components/Trade/TradeModule/SwapForm/MarginToggle'
import OrderTypeSelector from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector'
import { AvailableOrderType } from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector/types'
import TradeSummary from 'components/Trade/TradeModule/SwapForm/TradeSummary'
import { BNCoin } from 'types/classes/BNCoin'
import estimateExactIn from 'api/swap/estimateExactIn'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
}

export default function SwapForm(props: Props) {
  const { buyAsset, sellAsset } = props
  const account = useCurrentAccount()
  const { data: prices } = usePrices()
  const swap = useStore((s) => s.swap)
  const [isMarginChecked, setMarginChecked] = useState(false)
  const [buyAssetAmount, setBuyAssetAmount] = useState(ZERO)
  const [sellAssetAmount, setSellAssetAmount] = useState(ZERO)
  const [slippage] = useLocalStorage(SLIPPAGE_KEY, DEFAULT_SETTINGS.slippage)
  const [focusedInput, setFocusedInput] = useState<'buy' | 'sell' | null>(null)
  const [maxBuyableAmountEstimation, setMaxBuyableAmountEstimation] = useState(ZERO)
  const [selectedOrderType, setSelectedOrderType] = useState<AvailableOrderType>('Market')

  const accountSellAssetDeposit = useMemo(
    () => account?.deposits.find(byDenom(sellAsset.denom))?.amount || ZERO,
    [account, sellAsset.denom],
  )

  useEffect(() => {
    ;(async function () {
      const estimation = await estimateExactIn(
        { denom: sellAsset.denom, amount: accountSellAssetDeposit },
        buyAsset.denom,
      )

      setMaxBuyableAmountEstimation(estimation)
    })()
  }, [accountSellAssetDeposit, buyAsset.denom, sellAsset.denom])

  const [buyAssetValue, sellAssetValue] = useMemo(() => {
    const buyAssetPrice = prices.find(byDenom(buyAsset.denom))?.amount ?? ZERO
    const sellAssetPrice = prices.find(byDenom(sellAsset.denom))?.amount ?? ZERO

    return [
      buyAssetPrice.multipliedBy(buyAssetAmount.shiftedBy(-buyAsset.decimals)),
      sellAssetPrice.multipliedBy(sellAssetAmount.shiftedBy(-sellAsset.decimals)),
    ]
  }, [
    prices,
    buyAsset.denom,
    buyAsset.decimals,
    sellAsset.denom,
    sellAsset.decimals,
    buyAssetAmount,
    sellAssetAmount,
  ])

  useEffect(() => {
    if (focusedInput === 'sell') {
      estimateExactIn(
        { denom: sellAsset.denom, amount: sellAssetAmount.toString() },
        buyAsset.denom,
      ).then(setBuyAssetAmount)
    }
  }, [buyAsset.denom, focusedInput, sellAsset.denom, sellAssetAmount])

  useEffect(() => {
    if (focusedInput === 'buy') {
      estimateExactIn(
        {
          denom: buyAsset.denom,
          amount: buyAssetAmount.toString(),
        },
        sellAsset.denom,
      ).then(setSellAssetAmount)
    }
  }, [buyAsset.denom, buyAssetAmount, focusedInput, sellAsset.denom])

  useEffect(() => {
    setFocusedInput(null)
    setBuyAssetAmount(ZERO)
    setSellAssetAmount(ZERO)
  }, [sellAsset.denom])

  useEffect(() => {
    setFocusedInput(null)
  }, [buyAsset.denom])

  const handleBuyClick = useCallback(async () => {
    if (account?.id) {
      const isSucceeded = await swap({
        fee: hardcodedFee,
        accountId: account.id,
        coinIn: BNCoin.fromDenomAndBigNumber(sellAsset.denom, sellAssetAmount.integerValue()),
        denomOut: buyAsset.denom,
        slippage,
      })
      if (isSucceeded) {
        setSellAssetAmount(ZERO)
      }
    }
  }, [account?.id, buyAsset.denom, sellAsset.denom, sellAssetAmount, slippage, swap])

  return (
    <>
      <Divider />
      <MarginToggle checked={isMarginChecked} onChange={setMarginChecked} disabled />

      <Divider />
      <OrderTypeSelector selected={selectedOrderType} onChange={setSelectedOrderType} />

      <AssetAmountInput
        label='Buy'
        max={maxBuyableAmountEstimation}
        amount={buyAssetAmount}
        setAmount={setBuyAssetAmount}
        asset={buyAsset}
        assetUSDValue={buyAssetValue}
        maxButtonLabel='Max Amount:'
        containerClassName='mx-3 my-6'
        onFocus={() => setFocusedInput('buy')}
      />

      <RangeInput
        max={accountSellAssetDeposit.shiftedBy(-sellAsset.decimals).toNumber()}
        value={sellAssetAmount.shiftedBy(-sellAsset.decimals).toNumber()}
        onChange={(value) => {
          setFocusedInput('sell')
          setSellAssetAmount(BN(value).shiftedBy(sellAsset.decimals).integerValue())
        }}
        wrapperClassName='p-4'
      />

      <AssetAmountInput
        label='Sell'
        max={accountSellAssetDeposit}
        amount={sellAssetAmount}
        setAmount={setSellAssetAmount}
        assetUSDValue={sellAssetValue}
        asset={sellAsset}
        maxButtonLabel='Balance:'
        containerClassName='mx-3'
        onFocus={() => setFocusedInput('sell')}
      />

      <TradeSummary
        containerClassName='m-3 mt-10'
        buyAsset={buyAsset}
        sellAsset={sellAsset}
        buyAction={handleBuyClick}
        buyButtonDisabled={sellAssetAmount.isZero()}
      />
    </>
  )
}
