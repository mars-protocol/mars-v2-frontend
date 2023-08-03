import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Divider from 'components/Divider'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { SLIPPAGE_KEY } from 'constants/localStore'
import { BN_ZERO } from 'constants/math'
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
import useHealthComputer from 'hooks/useHealthComputer'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
}

export default function SwapForm(props: Props) {
  const { buyAsset, sellAsset } = props
  const account = useCurrentAccount()
  const { data: prices } = usePrices()
  const swap = useStore((s) => s.swap)
  const [slippage] = useLocalStorage(SLIPPAGE_KEY, DEFAULT_SETTINGS.slippage)
  const { computeMaxSwapAmount } = useHealthComputer(account)
  const buyAmountEstimationTimeout = useRef<NodeJS.Timeout | undefined>(undefined)

  const [isMarginChecked, setMarginChecked] = useState(false)
  const [buyAssetAmount, setBuyAssetAmount] = useState(BN_ZERO)
  const [sellAssetAmount, setSellAssetAmount] = useState(BN_ZERO)
  const focusedInput = useRef<'buy' | 'sell' | null>(null)
  const [maxBuyableAmountEstimation, setMaxBuyableAmountEstimation] = useState(BN_ZERO)
  const [selectedOrderType, setSelectedOrderType] = useState<AvailableOrderType>('Market')
  const [isTransactionExecuting, setTransactionExecuting] = useState(false)

  const [maxSellAssetAmount, maxSellAssetAmountStr] = useMemo(() => {
    const amount = computeMaxSwapAmount(sellAsset.denom, buyAsset.denom, 'default')
    return [amount, amount.toString()]
  }, [computeMaxSwapAmount, sellAsset.denom, buyAsset.denom])

  const [buyAssetValue, sellAssetValue] = useMemo(() => {
    const buyAssetPrice = prices.find(byDenom(buyAsset.denom))?.amount ?? BN_ZERO
    const sellAssetPrice = prices.find(byDenom(sellAsset.denom))?.amount ?? BN_ZERO

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
    focusedInput.current = null
    setBuyAssetAmount(BN_ZERO)
    setSellAssetAmount(BN_ZERO)
  }, [buyAsset.denom, sellAsset.denom])

  useEffect(() => {
    estimateExactIn({ denom: sellAsset.denom, amount: maxSellAssetAmountStr }, buyAsset.denom).then(
      setMaxBuyableAmountEstimation,
    )
  }, [maxSellAssetAmountStr, buyAsset.denom, sellAsset.denom])

  useEffect(() => {
    if (focusedInput.current === 'sell') {
      if (buyAmountEstimationTimeout.current) {
        clearTimeout(buyAmountEstimationTimeout.current)
      }

      buyAmountEstimationTimeout.current = setTimeout(
        () =>
          estimateExactIn(
            { denom: sellAsset.denom, amount: sellAssetAmount.toString() },
            buyAsset.denom,
          )
            .then(setBuyAssetAmount)
            .then(() => clearTimeout(buyAmountEstimationTimeout?.current)),
        250,
      )
    }
  }, [buyAsset.denom, focusedInput, sellAsset.denom, sellAssetAmount])

  useEffect(() => {
    if (focusedInput.current === 'buy') {
      estimateExactIn(
        {
          denom: buyAsset.denom,
          amount: buyAssetAmount.toString(),
        },
        sellAsset.denom,
      ).then(setSellAssetAmount)
    }
  }, [buyAsset.denom, buyAssetAmount, focusedInput, sellAsset.denom])

  const handleBuyClick = useCallback(async () => {
    if (account?.id) {
      setTransactionExecuting(true)
      const isSucceeded = await swap({
        fee: hardcodedFee,
        accountId: account.id,
        coinIn: BNCoin.fromDenomAndBigNumber(sellAsset.denom, sellAssetAmount.integerValue()),
        denomOut: buyAsset.denom,
        slippage,
      })
      if (isSucceeded) {
        setSellAssetAmount(BN_ZERO)
        setBuyAssetAmount(BN_ZERO)
      }
      setTransactionExecuting(false)
    }
  }, [account?.id, buyAsset.denom, sellAsset.denom, sellAssetAmount, slippage, swap])

  const dismissInputFocus = useCallback(() => (focusedInput.current = null), [])

  const handleRangeInputChange = useCallback(
    (value: number) => {
      focusedInput.current = 'sell'
      setSellAssetAmount(BN(value).shiftedBy(sellAsset.decimals).integerValue())
    },
    [sellAsset.decimals],
  )

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
        onBlur={dismissInputFocus}
        onFocus={() => (focusedInput.current = 'buy')}
        disabled={isTransactionExecuting}
      />

      <RangeInput
        wrapperClassName='p-4'
        onBlur={dismissInputFocus}
        disabled={isTransactionExecuting || maxSellAssetAmount.isZero()}
        onChange={handleRangeInputChange}
        value={sellAssetAmount.shiftedBy(-sellAsset.decimals).toNumber()}
        max={maxSellAssetAmount.shiftedBy(-sellAsset.decimals).toNumber()}
      />

      <AssetAmountInput
        label='Sell'
        max={maxSellAssetAmount}
        amount={sellAssetAmount}
        setAmount={setSellAssetAmount}
        assetUSDValue={sellAssetValue}
        asset={sellAsset}
        maxButtonLabel='Balance:'
        containerClassName='mx-3'
        onBlur={dismissInputFocus}
        onFocus={() => (focusedInput.current = 'sell')}
        disabled={isTransactionExecuting}
      />

      <TradeSummary
        containerClassName='m-3 mt-10'
        buyAsset={buyAsset}
        sellAsset={sellAsset}
        buyAction={handleBuyClick}
        buyButtonDisabled={sellAssetAmount.isZero()}
        showProgressIndicator={isTransactionExecuting}
      />
    </>
  )
}
