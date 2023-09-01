import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useState } from 'react'

import estimateExactIn from 'api/swap/estimateExactIn'
import DepositCapMessage from 'components/DepositCap'
import Divider from 'components/Divider'
import RangeInput from 'components/RangeInput'
import AssetAmountInput from 'components/Trade/TradeModule/SwapForm/AssetAmountInput'
import MarginToggle from 'components/Trade/TradeModule/SwapForm/MarginToggle'
import OrderTypeSelector from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector'
import { AvailableOrderType } from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector/types'
import TradeSummary from 'components/Trade/TradeModule/SwapForm/TradeSummary'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { SLIPPAGE_KEY } from 'constants/localStore'
import { BN_ZERO } from 'constants/math'
import useAutoLendEnabledAccountIds from 'hooks/useAutoLendEnabledAccountIds'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useHealthComputer from 'hooks/useHealthComputer'
import useLocalStorage from 'hooks/useLocalStorage'
import useMarketAssets from 'hooks/useMarketAssets'
import useMarketBorrowings from 'hooks/useMarketBorrowings'
import usePrices from 'hooks/usePrices'
import useToggle from 'hooks/useToggle'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { defaultFee, DEPOSIT_CAP_BUFFER } from 'utils/constants'
import { asyncThrottle, BN } from 'utils/helpers'

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
  const { data: marketAssets } = useMarketAssets()

  const [isMarginChecked, setMarginChecked] = useToggle()
  const [buyAssetAmount, setBuyAssetAmount] = useState(BN_ZERO)
  const [sellAssetAmount, setSellAssetAmount] = useState(BN_ZERO)
  const [maxBuyableAmountEstimation, setMaxBuyableAmountEstimation] = useState(BN_ZERO)
  const [selectedOrderType, setSelectedOrderType] = useState<AvailableOrderType>('Market')
  const [isConfirming, setIsConfirming] = useToggle()
  const [estimatedFee, setEstimatedFee] = useState(defaultFee)
  const { autoLendEnabledAccountIds } = useAutoLendEnabledAccountIds()
  const isAutoLendEnabled = account ? autoLendEnabledAccountIds.includes(account.id) : false

  const throttledEstimateExactIn = useMemo(() => asyncThrottle(estimateExactIn, 250), [])
  const { simulateTrade } = useUpdatedAccount(account)

  const borrowAsset = useMemo(
    () => borrowAssets.find(byDenom(sellAsset.denom)),
    [borrowAssets, sellAsset.denom],
  )

  const depositCapReachedCoins: BNCoin[] = useMemo(() => {
    const buyMarketAsset = marketAssets.find(byDenom(buyAsset.denom))

    if (!buyMarketAsset) return []

    const depositCapLeft = buyMarketAsset.cap.max
      .minus(buyMarketAsset.cap.used)
      .times(DEPOSIT_CAP_BUFFER)
      .integerValue()

    if (buyAssetAmount.isGreaterThan(depositCapLeft)) {
      return [BNCoin.fromDenomAndBigNumber(buyAsset.denom, depositCapLeft)]
    }

    return []
  }, [marketAssets, buyAsset.denom, buyAssetAmount])

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
      onChangeBuyAmount(BN(value).shiftedBy(buyAsset.decimals).integerValue())
    },
    [onChangeBuyAmount, buyAsset.decimals],
  )

  const [maxSellAmount, sellSideMarginThreshold, marginRatio] = useMemo(() => {
    const maxAmount = computeMaxSwapAmount(sellAsset.denom, buyAsset.denom, 'default')
    const maxAmountOnMargin = computeMaxSwapAmount(sellAsset.denom, buyAsset.denom, 'margin')
    const marginRatio = maxAmount.dividedBy(maxAmountOnMargin)

    estimateExactIn(
      {
        denom: sellAsset.denom,
        amount: (isMarginChecked ? maxAmountOnMargin : maxAmount).toString(),
      },
      buyAsset.denom,
    ).then(setMaxBuyableAmountEstimation)

    if (isMarginChecked) return [maxAmountOnMargin, maxAmount, marginRatio]

    if (sellAssetAmount.isGreaterThan(maxAmount)) onChangeSellAmount(maxAmount)

    return [maxAmount, maxAmount, marginRatio]
  }, [
    computeMaxSwapAmount,
    sellAsset.denom,
    buyAsset.denom,
    isMarginChecked,
    onChangeSellAmount,
    sellAssetAmount,
  ])

  const buySideMarginThreshold = useMemo(() => {
    return maxBuyableAmountEstimation.multipliedBy(marginRatio)
  }, [marginRatio, maxBuyableAmountEstimation])

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
    const borrowCoin = sellAssetAmount.isGreaterThan(sellSideMarginThreshold)
      ? BNCoin.fromDenomAndBigNumber(
          sellAsset.denom,
          sellAssetAmount.minus(sellSideMarginThreshold),
        )
      : undefined

    return swap({
      accountId: account?.id || '',
      coinIn: BNCoin.fromDenomAndBigNumber(sellAsset.denom, sellAssetAmount.integerValue()),
      borrow: borrowCoin,
      denomOut: buyAsset.denom,
      slippage,
      isMax: sellAssetAmount.isEqualTo(maxSellAmount),
    })
  }, [
    account?.id,
    buyAsset.denom,
    sellSideMarginThreshold,
    sellAsset.denom,
    sellAssetAmount,
    slippage,
    swap,
    maxSellAmount,
  ])

  const debouncedUpdateAccount = useMemo(
    () =>
      debounce((removeCoin: BNCoin, addCoin: BNCoin, debtCoin: BNCoin) => {
        simulateTrade(removeCoin, addCoin, debtCoin, isAutoLendEnabled ? 'lend' : 'deposit')
      }, 100),
    [simulateTrade, isAutoLendEnabled],
  )

  useEffect(() => {
    setBuyAssetAmount(BN_ZERO)
    setSellAssetAmount(BN_ZERO)
    simulateTrade(
      BNCoin.fromDenomAndBigNumber(buyAsset.denom, BN_ZERO),
      BNCoin.fromDenomAndBigNumber(sellAsset.denom, BN_ZERO),
      BNCoin.fromDenomAndBigNumber(sellAsset.denom, BN_ZERO),
      isAutoLendEnabled ? 'lend' : 'deposit',
    )
  }, [buyAsset.denom, sellAsset.denom, simulateTrade, isAutoLendEnabled])

  useEffect(() => {
    const removeDepositAmount = sellAssetAmount.isGreaterThanOrEqualTo(sellSideMarginThreshold)
      ? sellSideMarginThreshold
      : sellAssetAmount
    const addDebtAmount = sellAssetAmount.isGreaterThan(sellSideMarginThreshold)
      ? sellAssetAmount.minus(sellSideMarginThreshold)
      : BN_ZERO
    const removeCoin = BNCoin.fromDenomAndBigNumber(sellAsset.denom, removeDepositAmount)
    const debtCoin = BNCoin.fromDenomAndBigNumber(sellAsset.denom, addDebtAmount)
    const addCoin = BNCoin.fromDenomAndBigNumber(buyAsset.denom, buyAssetAmount)

    debouncedUpdateAccount(removeCoin, addCoin, debtCoin)
  }, [
    sellAssetAmount,
    buyAssetAmount,
    sellSideMarginThreshold,
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
  }, [account?.id, swapTx, setIsConfirming])

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
      <div className='flex flex-col gap-6 px-3 mt-6'>
        <AssetAmountInput
          label='Buy'
          max={maxBuyableAmountEstimation}
          amount={buyAssetAmount}
          setAmount={onChangeBuyAmount}
          asset={buyAsset}
          assetUSDValue={buyAssetValue}
          maxButtonLabel='Max Amount:'
          disabled={isConfirming}
        />

        <RangeInput
          disabled={isConfirming || maxBuyableAmountEstimation.isZero()}
          onChange={handleRangeInputChange}
          value={buyAssetAmount.shiftedBy(-buyAsset.decimals).toNumber()}
          max={maxBuyableAmountEstimation.shiftedBy(-buyAsset.decimals).toNumber()}
          marginThreshold={
            isMarginChecked
              ? buySideMarginThreshold.shiftedBy(-buyAsset.decimals).toNumber()
              : undefined
          }
        />

        <DepositCapMessage action='buy' coins={depositCapReachedCoins} className='p-4 bg-white/5' />

        <AssetAmountInput
          label='Sell'
          max={maxSellAmount}
          amount={sellAssetAmount}
          setAmount={onChangeSellAmount}
          assetUSDValue={sellAssetValue}
          asset={sellAsset}
          maxButtonLabel='Balance:'
          disabled={isConfirming}
        />

        <TradeSummary
          buyAsset={buyAsset}
          sellAsset={sellAsset}
          borrowRate={borrowAsset?.borrowRate}
          buyAction={handleBuyClick}
          buyButtonDisabled={sellAssetAmount.isZero() || depositCapReachedCoins.length > 0}
          showProgressIndicator={isConfirming}
          isMargin={isMarginChecked}
          borrowAmount={
            sellAssetAmount.isGreaterThan(sellSideMarginThreshold)
              ? sellAssetAmount.minus(sellSideMarginThreshold)
              : BN_ZERO
          }
          estimatedFee={estimatedFee}
        />
      </div>
    </>
  )
}
