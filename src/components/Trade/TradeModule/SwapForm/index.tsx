import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Divider from 'components/Divider'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { SLIPPAGE_KEY } from 'constants/localStore'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { defaultFee } from 'utils/constants'
import RangeInput from 'components/RangeInput'
import { asyncThrottle, BN } from 'utils/helpers'
import AssetAmountInput from 'components/Trade/TradeModule/SwapForm/AssetAmountInput'
import MarginToggle from 'components/Trade/TradeModule/SwapForm/MarginToggle'
import OrderTypeSelector from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector'
import { AvailableOrderType } from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector/types'
import TradeSummary from 'components/Trade/TradeModule/SwapForm/TradeSummary'
import { BNCoin } from 'types/classes/BNCoin'
import estimateExactIn from 'api/swap/estimateExactIn'
import useHealthComputer from 'hooks/useHealthComputer'
import useMarketBorrowings from 'hooks/useMarketBorrowings'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'

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
  const { data: borrowAssets } = useMarketBorrowings()

  const [isMarginChecked, setMarginChecked] = useState(false)
  const [buyAssetAmount, setBuyAssetAmount] = useState(BN_ZERO)
  const [sellAssetAmount, setSellAssetAmount] = useState(BN_ZERO)
  const [maxBuyableAmountEstimation, setMaxBuyableAmountEstimation] = useState(BN_ZERO)
  const [selectedOrderType, setSelectedOrderType] = useState<AvailableOrderType>('Market')
  const [isConfirming, setIsConfirming] = useState(false)
  const [estimatedFee, setEstimatedFee] = useState(defaultFee)

  const throttledEstimateExactIn = useMemo(() => asyncThrottle(estimateExactIn, 250), [])
  const { removeDeposits, addDeposits, addDebt } = useUpdatedAccount(account)

  const borrowAsset = useMemo(
    () => borrowAssets.find(byDenom(sellAsset.denom)),
    [borrowAssets, sellAsset.denom],
  )

  const onChangeSellAmount = useCallback(
    (amount: BigNumber) => {
      setSellAssetAmount(amount)
      throttledEstimateExactIn(
        { denom: sellAsset.denom, amount: amount.toString() },
        buyAsset.denom,
      ).then(setBuyAssetAmount)
    },
    [sellAsset.denom, throttledEstimateExactIn, buyAsset.denom],
  )

  const onChangeBuyAmount = useCallback(
    (amount: BigNumber) => {
      setBuyAssetAmount(amount)
      const swapFrom = {
        denom: buyAsset.denom,
        amount: amount.toString(),
      }
      throttledEstimateExactIn(swapFrom, sellAsset.denom).then(setSellAssetAmount)
    },
    [buyAsset.denom, throttledEstimateExactIn, sellAsset.denom],
  )

  const handleRangeInputChange = useCallback(
    (value: number) => {
      onChangeSellAmount(BN(value).shiftedBy(sellAsset.decimals).integerValue())
    },
    [sellAsset.decimals, onChangeSellAmount],
  )

  const [maxSellAmount, marginThreshold] = useMemo(() => {
    const maxAmount = computeMaxSwapAmount(sellAsset.denom, buyAsset.denom, 'default')
    const maxAmountOnMargin = computeMaxSwapAmount(sellAsset.denom, buyAsset.denom, 'margin')

    estimateExactIn(
      {
        denom: sellAsset.denom,
        amount: (isMarginChecked ? maxAmountOnMargin : maxAmount).toString(),
      },
      buyAsset.denom,
    ).then(setMaxBuyableAmountEstimation)

    if (isMarginChecked) return [maxAmountOnMargin, maxAmount]

    if (sellAssetAmount.isGreaterThan(maxAmount)) onChangeSellAmount(maxAmount)

    return [maxAmount, maxAmount]
  }, [
    computeMaxSwapAmount,
    sellAsset.denom,
    buyAsset.denom,
    isMarginChecked,
    onChangeSellAmount,
    sellAssetAmount,
  ])

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

  const swapTx = useMemo(() => {
    const borrowCoin = sellAssetAmount.isGreaterThan(marginThreshold)
      ? BNCoin.fromDenomAndBigNumber(sellAsset.denom, sellAssetAmount.minus(marginThreshold))
      : undefined

    return swap({
      accountId: account?.id || '',
      coinIn: BNCoin.fromDenomAndBigNumber(sellAsset.denom, sellAssetAmount.integerValue()),
      borrow: borrowCoin,
      denomOut: buyAsset.denom,
      slippage,
    })
  }, [
    account?.id,
    buyAsset.denom,
    marginThreshold,
    sellAsset.denom,
    sellAssetAmount,
    slippage,
    swap,
  ])

  const debouncedUpdateAccount = useMemo(
    () =>
      debounce((removeCoin: BNCoin, addCoin: BNCoin, debtCoin: BNCoin) => {
        removeDeposits([removeCoin])
        addDeposits([addCoin])
        if (debtCoin.amount.isGreaterThan(BN_ZERO)) addDebt([debtCoin])
      }, 1000),
    [removeDeposits, addDeposits, addDebt],
  )

  useEffect(() => {
    setBuyAssetAmount(BN_ZERO)
    setSellAssetAmount(BN_ZERO)
    removeDeposits([])
    addDeposits([])
    addDebt([])
  }, [buyAsset.denom, sellAsset.denom, removeDeposits, addDeposits, addDebt])

  useEffect(() => {
    const removeDepositAmount = sellAssetAmount.isGreaterThanOrEqualTo(marginThreshold)
      ? marginThreshold
      : sellAssetAmount
    const addDebtAmount = sellAssetAmount.isGreaterThan(marginThreshold)
      ? sellAssetAmount.minus(marginThreshold)
      : BN_ZERO
    const removeCoin = BNCoin.fromDenomAndBigNumber(sellAsset.denom, removeDepositAmount)
    const debtCoin = BNCoin.fromDenomAndBigNumber(sellAsset.denom, addDebtAmount)
    const addCoin = BNCoin.fromDenomAndBigNumber(buyAsset.denom, buyAssetAmount)

    debouncedUpdateAccount(removeCoin, addCoin, debtCoin)
  }, [
    sellAssetAmount,
    buyAssetAmount,
    marginThreshold,
    buyAsset.denom,
    sellAsset.denom,
    debouncedUpdateAccount,
  ])

  useEffect(() => {
    swapTx.estimateFee().then(setEstimatedFee)
  }, [swapTx])

  const handleBuyClick = useCallback(async () => {
    if (account?.id) {
      setIsConfirming(true)

      const isSucceeded = await swapTx.execute()

      if (isSucceeded) {
        setSellAssetAmount(BN_ZERO)
        setBuyAssetAmount(BN_ZERO)
      }
      setIsConfirming(false)
    }
  }, [account?.id, swapTx])

  return (
    <>
      <Divider />
      <MarginToggle
        checked={isMarginChecked}
        onChange={setMarginChecked}
        disabled={!borrowAsset?.isMarket}
        borrowAssetSymbol={sellAsset.symbol}
      />
      <Divider />
      <OrderTypeSelector selected={selectedOrderType} onChange={setSelectedOrderType} />
      <AssetAmountInput
        label='Buy'
        max={maxBuyableAmountEstimation}
        amount={buyAssetAmount}
        setAmount={onChangeBuyAmount}
        asset={buyAsset}
        assetUSDValue={buyAssetValue}
        maxButtonLabel='Max Amount:'
        containerClassName='mx-3 my-6'
        disabled={isConfirming}
      />

      <RangeInput
        wrapperClassName='p-4'
        disabled={isConfirming || maxSellAmount.isZero()}
        onChange={handleRangeInputChange}
        value={sellAssetAmount.shiftedBy(-sellAsset.decimals).toNumber()}
        max={maxSellAmount.shiftedBy(-sellAsset.decimals).toNumber()}
        marginThreshold={
          isMarginChecked ? marginThreshold.shiftedBy(-sellAsset.decimals).toNumber() : undefined
        }
      />

      <AssetAmountInput
        label='Sell'
        max={maxSellAmount}
        amount={sellAssetAmount}
        setAmount={onChangeSellAmount}
        assetUSDValue={sellAssetValue}
        asset={sellAsset}
        maxButtonLabel='Balance:'
        containerClassName='mx-3'
        disabled={isConfirming}
      />

      <TradeSummary
        containerClassName='m-3 mt-10'
        buyAsset={buyAsset}
        sellAsset={sellAsset}
        borrowRate={borrowAsset?.borrowRate}
        buyAction={handleBuyClick}
        buyButtonDisabled={sellAssetAmount.isZero()}
        showProgressIndicator={isConfirming}
        isMargin={isMarginChecked}
        borrowAmount={
          sellAssetAmount.isGreaterThan(marginThreshold)
            ? sellAssetAmount.minus(marginThreshold)
            : BN_ZERO
        }
        estimatedFee={estimatedFee}
      />
    </>
  )
}
