import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useState } from 'react'

import estimateExactIn from 'api/swap/estimateExactIn'
import AvailableLiquidityMessage from 'components/AvailableLiquidityMessage'
import DepositCapMessage from 'components/DepositCapMessage'
import Divider from 'components/Divider'
import RangeInput from 'components/RangeInput'
import AssetAmountInput from 'components/Trade/TradeModule/SwapForm/AssetAmountInput'
import AutoRepayToggle from 'components/Trade/TradeModule/SwapForm/AutoRepayToggle'
import MarginToggle from 'components/Trade/TradeModule/SwapForm/MarginToggle'
import OrderTypeSelector from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector'
import { AvailableOrderType } from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector/types'
import TradeSummary from 'components/Trade/TradeModule/SwapForm/TradeSummary'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useAutoLend from 'hooks/useAutoLend'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useHealthComputer from 'hooks/useHealthComputer'
import useLocalStorage from 'hooks/useLocalStorage'
import useMarketAssets from 'hooks/useMarketAssets'
import useMarketBorrowings from 'hooks/useMarketBorrowings'
import useSwapRoute from 'hooks/useSwapRoute'
import useToggle from 'hooks/useToggle'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { defaultFee, ENABLE_AUTO_REPAY } from 'utils/constants'
import { getCapLeftWithBuffer } from 'utils/generic'
import { asyncThrottle, BN } from 'utils/helpers'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
}

export default function SwapForm(props: Props) {
  const { buyAsset, sellAsset } = props
  const useMargin = useStore((s) => s.useMargin)
  const useAutoRepay = useStore((s) => s.useAutoRepay)
  const account = useCurrentAccount()
  const swap = useStore((s) => s.swap)
  const [slippage] = useLocalStorage(LocalStorageKeys.SLIPPAGE, DEFAULT_SETTINGS.slippage)
  const { computeMaxSwapAmount } = useHealthComputer(account)
  const { data: borrowAssets } = useMarketBorrowings()
  const { data: marketAssets } = useMarketAssets()
  const { data: route, isLoading: isRouteLoading } = useSwapRoute(sellAsset.denom, buyAsset.denom)
  const isBorrowEnabled = !!marketAssets.find(byDenom(sellAsset.denom))?.borrowEnabled
  const isRepayable = !!account?.debts.find(byDenom(buyAsset.denom))
  const [isMarginChecked, setMarginChecked] = useToggle(isBorrowEnabled ? useMargin : false)
  const [isAutoRepayChecked, setAutoRepayChecked] = useToggle(
    isRepayable && ENABLE_AUTO_REPAY ? useAutoRepay : false,
  )
  const [buyAssetAmount, setBuyAssetAmount] = useState(BN_ZERO)
  const [sellAssetAmount, setSellAssetAmount] = useState(BN_ZERO)
  const [maxBuyableAmountEstimation, setMaxBuyableAmountEstimation] = useState(BN_ZERO)
  const [selectedOrderType, setSelectedOrderType] = useState<AvailableOrderType>('Market')
  const [isConfirming, setIsConfirming] = useToggle()
  const [estimatedFee, setEstimatedFee] = useState(defaultFee)
  const { autoLendEnabledAccountIds } = useAutoLend()
  const isAutoLendEnabled = account ? autoLendEnabledAccountIds.includes(account.id) : false
  const modal = useStore<string | null>((s) => s.fundAndWithdrawModal)
  const { simulateTrade, removedLends, updatedAccount } = useUpdatedAccount(account)
  const throttledEstimateExactIn = useMemo(() => asyncThrottle(estimateExactIn, 250), [])
  const { computeLiquidationPrice } = useHealthComputer(updatedAccount)

  const borrowAsset = useMemo(
    () => borrowAssets.find(byDenom(sellAsset.denom)),
    [borrowAssets, sellAsset.denom],
  )

  const depositCapReachedCoins: BNCoin[] = useMemo(() => {
    const buyMarketAsset = marketAssets.find(byDenom(buyAsset.denom))

    if (!buyMarketAsset) return []

    const depositCapLeft = getCapLeftWithBuffer(buyMarketAsset.cap)
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
    const maxAmountOnMargin = computeMaxSwapAmount(
      sellAsset.denom,
      buyAsset.denom,
      'margin',
    ).integerValue()
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
      reclaim: removedLends[0],
      borrow: borrowCoin,
      denomOut: buyAsset.denom,
      slippage,
      isMax: sellAssetAmount.isEqualTo(maxSellAmount),
      repay: isAutoRepayChecked,
    })
  }, [
    removedLends,
    account?.id,
    buyAsset.denom,
    sellSideMarginThreshold,
    sellAsset.denom,
    sellAssetAmount,
    slippage,
    swap,
    maxSellAmount,
    isAutoRepayChecked,
  ])

  const debouncedUpdateAccount = useMemo(
    () =>
      debounce((removeCoin: BNCoin, addCoin: BNCoin, debtCoin: BNCoin) => {
        simulateTrade(
          removeCoin,
          addCoin,
          debtCoin,
          isAutoLendEnabled && !isAutoRepayChecked ? 'lend' : 'deposit',
          isAutoRepayChecked,
        )
      }, 100),
    [simulateTrade, isAutoLendEnabled, isAutoRepayChecked],
  )

  const handleMarginToggleChange = useCallback(
    (isMargin: boolean) => {
      if (isBorrowEnabled) useStore.setState({ useMargin: isMargin })
      setMarginChecked(isBorrowEnabled ? isMargin : false)
    },
    [isBorrowEnabled, setMarginChecked],
  )
  const handleAutoRepayToggleChange = useCallback(
    (isAutoRepay: boolean) => {
      if (isRepayable) useStore.setState({ useAutoRepay: isAutoRepay })
      setAutoRepayChecked(isAutoRepay)
    },
    [isRepayable, setAutoRepayChecked],
  )

  const liquidationPrice = useMemo(
    () => computeLiquidationPrice(props.buyAsset.denom, 'asset'),
    [computeLiquidationPrice, props.buyAsset.denom],
  )

  useEffect(() => {
    setBuyAssetAmount(BN_ZERO)
    setSellAssetAmount(BN_ZERO)
    setMarginChecked(isBorrowEnabled ? useMargin : false)
    setAutoRepayChecked(isRepayable ? useAutoRepay : false)
    simulateTrade(
      BNCoin.fromDenomAndBigNumber(buyAsset.denom, BN_ZERO),
      BNCoin.fromDenomAndBigNumber(sellAsset.denom, BN_ZERO),
      BNCoin.fromDenomAndBigNumber(sellAsset.denom, BN_ZERO),
      isAutoLendEnabled && !isAutoRepayChecked ? 'lend' : 'deposit',
      isAutoRepayChecked,
    )
  }, [
    isBorrowEnabled,
    isRepayable,
    useMargin,
    useAutoRepay,
    buyAsset.denom,
    sellAsset.denom,
    isAutoLendEnabled,
    isAutoRepayChecked,
    simulateTrade,
    setMarginChecked,
    setAutoRepayChecked,
  ])

  useEffect(() => {
    const removeDepositAmount = sellAssetAmount.isGreaterThanOrEqualTo(sellSideMarginThreshold)
      ? sellSideMarginThreshold
      : sellAssetAmount
    const addDebtAmount = sellAssetAmount.isGreaterThan(sellSideMarginThreshold)
      ? sellAssetAmount.minus(sellSideMarginThreshold)
      : BN_ZERO

    if (removeDepositAmount.isZero() && addDebtAmount.isZero() && buyAssetAmount.isZero() && modal)
      return
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
    modal,
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

  useEffect(() => {
    if (sellAssetAmount.isEqualTo(maxSellAmount) || buyAssetAmount.isZero()) return
    if (buyAssetAmount.isEqualTo(maxBuyableAmountEstimation)) setSellAssetAmount(maxSellAmount)
  }, [sellAssetAmount, maxSellAmount, buyAssetAmount, maxBuyableAmountEstimation])

  const borrowAmount = useMemo(
    () =>
      sellAssetAmount.isGreaterThan(sellSideMarginThreshold)
        ? sellAssetAmount.minus(sellSideMarginThreshold)
        : BN_ZERO,
    [sellAssetAmount, sellSideMarginThreshold],
  )

  const availableLiquidity = useMemo(
    () => borrowAsset?.liquidity?.amount ?? BN_ZERO,
    [borrowAsset?.liquidity?.amount],
  )

  const isSwapDisabled = useMemo(
    () =>
      sellAssetAmount.isZero() ||
      depositCapReachedCoins.length > 0 ||
      borrowAmount.isGreaterThan(availableLiquidity) ||
      route.length === 0,
    [sellAssetAmount, depositCapReachedCoins, borrowAmount, availableLiquidity, route],
  )

  return (
    <>
      <Divider />
      <MarginToggle
        checked={isMarginChecked}
        onChange={handleMarginToggleChange}
        disabled={!borrowAsset?.isMarket}
        borrowAssetSymbol={sellAsset.symbol}
      />
      <Divider />

      {isRepayable && ENABLE_AUTO_REPAY && (
        <AutoRepayToggle
          checked={isAutoRepayChecked}
          onChange={handleAutoRepayToggleChange}
          buyAssetSymbol={buyAsset.symbol}
        />
      )}
      <Divider />
      <div className='px-3'>
        <OrderTypeSelector selected={selectedOrderType} onChange={setSelectedOrderType} />
      </div>
      <div className='flex flex-col gap-6 px-3 mt-6'>
        <AssetAmountInput
          label='Buy'
          max={maxBuyableAmountEstimation}
          amount={buyAssetAmount}
          setAmount={onChangeBuyAmount}
          asset={buyAsset}
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

        {borrowAsset && borrowAmount.isGreaterThanOrEqualTo(availableLiquidity) && (
          <AvailableLiquidityMessage
            availableLiquidity={borrowAsset?.liquidity?.amount ?? BN_ZERO}
            asset={borrowAsset}
          />
        )}
        <AssetAmountInput
          label='Sell'
          max={maxSellAmount}
          amount={sellAssetAmount}
          setAmount={onChangeSellAmount}
          asset={sellAsset}
          maxButtonLabel='Balance:'
          disabled={isConfirming}
        />

        <TradeSummary
          buyAsset={buyAsset}
          sellAsset={sellAsset}
          borrowRate={borrowAsset?.borrowRate}
          buyAction={handleBuyClick}
          buyButtonDisabled={isSwapDisabled}
          showProgressIndicator={isConfirming || isRouteLoading}
          isMargin={isMarginChecked}
          borrowAmount={borrowAmount}
          estimatedFee={estimatedFee}
          route={route}
          liquidationPrice={liquidationPrice}
          sellAmount={sellAssetAmount}
          buyAmount={buyAssetAmount}
        />
      </div>
    </>
  )
}
