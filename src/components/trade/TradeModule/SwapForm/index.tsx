import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useState } from 'react'

import estimateExactIn from 'api/swap/estimateExactIn'
import AvailableLiquidityMessage from 'components/common/AvailableLiquidityMessage'
import DepositCapMessage from 'components/common/DepositCapMessage'
import Divider from 'components/common/Divider'
import LeverageSlider from 'components/common/LeverageSlider'
import Text from 'components/common/Text'
import { TradeDirectionSelector } from 'components/common/TradeDirectionSelector'
import AssetSelectorPair from 'components/trade/TradeModule/AssetSelector/AssetSelectorPair'
import AssetSelectorSingle from 'components/trade/TradeModule/AssetSelector/AssetSelectorSingle'
import AssetAmountInput from 'components/trade/TradeModule/SwapForm/AssetAmountInput'
import AutoRepayToggle from 'components/trade/TradeModule/SwapForm/AutoRepayToggle'
import MarginToggle from 'components/trade/TradeModule/SwapForm/MarginToggle'
import OrderTypeSelector from 'components/trade/TradeModule/SwapForm/OrderTypeSelector'
import { AvailableOrderType } from 'components/trade/TradeModule/SwapForm/OrderTypeSelector/types'
import TradeSummary from 'components/trade/TradeModule/SwapForm/TradeSummary'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useMarketEnabledAssets from 'hooks/assets/useMarketEnabledAssets'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useMarkets from 'hooks/markets/useMarkets'
import useRouteInfo from 'hooks/trade/useRouteInfo'
import useAutoLend from 'hooks/useAutoLend'
import useChainConfig from 'hooks/useChainConfig'
import useHealthComputer from 'hooks/useHealthComputer'
import useToggle from 'hooks/useToggle'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { defaultFee, ENABLE_AUTO_REPAY } from 'utils/constants'
import { formatValue } from 'utils/formatters'
import { getCapLeftWithBuffer } from 'utils/generic'
import { asyncThrottle, BN } from 'utils/helpers'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  isAdvanced: boolean
}

export default function SwapForm(props: Props) {
  const { buyAsset, sellAsset, isAdvanced } = props
  const useMargin = useStore((s) => s.useMargin)
  const useAutoRepay = useStore((s) => s.useAutoRepay)
  const account = useCurrentAccount()
  const swap = useStore((s) => s.swap)
  const [slippage] = useLocalStorage(LocalStorageKeys.SLIPPAGE, DEFAULT_SETTINGS.slippage)
  const { computeMaxSwapAmount } = useHealthComputer(account)
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('long')
  const markets = useMarkets()

  const [inputAsset, outputAsset] = useMemo(() => {
    if (isAdvanced) return [sellAsset, buyAsset]
    if (tradeDirection === 'long') return [sellAsset, buyAsset]
    return [buyAsset, sellAsset]
  }, [buyAsset, sellAsset, tradeDirection, isAdvanced])
  const isBorrowEnabled = !!markets.find((market) => market.asset.denom === inputAsset.denom)
    ?.borrowEnabled
  const isRepayable = !!account?.debts.find(byDenom(outputAsset.denom))
  const [isMarginChecked, setMarginChecked] = useToggle(isBorrowEnabled ? useMargin : false)
  const [isAutoRepayChecked, setAutoRepayChecked] = useToggle(
    isRepayable && ENABLE_AUTO_REPAY ? useAutoRepay : false,
  )
  const [outputAssetAmount, setOutputAssetAmount] = useState(BN_ZERO)
  const [inputAssetAmount, setInputAssetAmount] = useState(BN_ZERO)
  const [maxOutputAmountEstimation, setMaxBuyableAmountEstimation] = useState(BN_ZERO)
  const [selectedOrderType, setSelectedOrderType] = useState<AvailableOrderType>('Market')
  const [isConfirming, setIsConfirming] = useToggle()
  const [estimatedFee, setEstimatedFee] = useState(defaultFee)
  const { autoLendEnabledAccountIds } = useAutoLend()
  const isAutoLendEnabled = account ? autoLendEnabledAccountIds.includes(account.id) : false
  const modal = useStore<string | null>((s) => s.fundAndWithdrawModal)
  const { simulateTrade, removedLends, updatedAccount } = useUpdatedAccount(account)
  const throttledEstimateExactIn = useMemo(() => asyncThrottle(estimateExactIn, 250), [])
  const { computeLiquidationPrice } = useHealthComputer(updatedAccount)
  const chainConfig = useChainConfig()
  const assets = useMarketEnabledAssets()

  const { data: routeInfo } = useRouteInfo(inputAsset.denom, outputAsset.denom, inputAssetAmount)

  const depositCapReachedCoins: BNCoin[] = useMemo(() => {
    const outputMarketAsset = markets.find((market) => market.asset.denom === outputAsset.denom)

    if (!outputMarketAsset) return []

    const depositCapLeft = getCapLeftWithBuffer(outputMarketAsset.cap)
    if (outputAssetAmount.isGreaterThan(depositCapLeft)) {
      return [BNCoin.fromDenomAndBigNumber(outputAsset.denom, depositCapLeft)]
    }

    return []
  }, [markets, outputAsset.denom, outputAssetAmount])

  const onChangeInputAmount = useCallback(
    (amount: BigNumber) => {
      setInputAssetAmount(amount)
      const swapTo = { denom: inputAsset.denom, amount: amount.toString() }
      throttledEstimateExactIn(chainConfig, swapTo, outputAsset.denom).then(setOutputAssetAmount)
    },
    [inputAsset.denom, throttledEstimateExactIn, chainConfig, outputAsset.denom],
  )

  const onChangeOutputAmount = useCallback(
    (amount: BigNumber) => {
      setOutputAssetAmount(amount)
      const swapFrom = {
        denom: outputAsset.denom,
        amount: amount.toString(),
      }
      throttledEstimateExactIn(chainConfig, swapFrom, inputAsset.denom).then(setInputAssetAmount)
    },
    [outputAsset.denom, throttledEstimateExactIn, chainConfig, inputAsset.denom],
  )

  const handleRangeInputChange = useCallback(
    (value: number) => {
      onChangeOutputAmount(BN(value).shiftedBy(outputAsset.decimals).integerValue())
    },
    [onChangeOutputAmount, outputAsset.decimals],
  )

  const [maxInputAmount, imputMarginThreshold, marginRatio] = useMemo(() => {
    const maxAmount = computeMaxSwapAmount(inputAsset.denom, outputAsset.denom, 'default')
    const maxAmountOnMargin = computeMaxSwapAmount(
      inputAsset.denom,
      outputAsset.denom,
      'margin',
    ).integerValue()
    const marginRatio = maxAmount.dividedBy(maxAmountOnMargin)

    estimateExactIn(
      chainConfig,
      {
        denom: inputAsset.denom,
        amount: (isMarginChecked ? maxAmountOnMargin : maxAmount).toString(),
      },
      outputAsset.denom,
    ).then(setMaxBuyableAmountEstimation)

    if (isMarginChecked) return [maxAmountOnMargin, maxAmount, marginRatio]

    if (inputAssetAmount.isGreaterThan(maxAmount)) onChangeInputAmount(maxAmount)

    return [maxAmount, maxAmount, marginRatio]
  }, [
    computeMaxSwapAmount,
    inputAsset.denom,
    outputAsset.denom,
    chainConfig,
    isMarginChecked,
    inputAssetAmount,
    onChangeInputAmount,
  ])

  const outputSideMarginThreshold = useMemo(() => {
    return maxOutputAmountEstimation.multipliedBy(marginRatio)
  }, [marginRatio, maxOutputAmountEstimation])

  const swapTx = useMemo(() => {
    if (!routeInfo) return

    const borrowCoin = inputAssetAmount.isGreaterThan(imputMarginThreshold)
      ? BNCoin.fromDenomAndBigNumber(inputAsset.denom, inputAssetAmount.minus(imputMarginThreshold))
      : undefined

    return swap({
      accountId: account?.id || '',
      coinIn: BNCoin.fromDenomAndBigNumber(inputAsset.denom, inputAssetAmount.integerValue()),
      reclaim: removedLends[0],
      borrow: borrowCoin,
      denomOut: outputAsset.denom,
      slippage,
      isMax: inputAssetAmount.isEqualTo(maxInputAmount),
      repay: isAutoRepayChecked,
      route: routeInfo.route,
    })
  }, [
    routeInfo,
    inputAssetAmount,
    imputMarginThreshold,
    inputAsset.denom,
    swap,
    account?.id,
    removedLends,
    outputAsset.denom,
    slippage,
    maxInputAmount,
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
      }, 250),
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
    () => computeLiquidationPrice(outputAsset.denom, 'asset'),
    [computeLiquidationPrice, outputAsset.denom],
  )

  useEffect(() => {
    swapTx?.estimateFee().then(setEstimatedFee)
  }, [swapTx])

  const handleBuyClick = useCallback(async () => {
    if (account?.id) {
      setIsConfirming(true)

      const isSucceeded = await swapTx?.execute()

      if (isSucceeded) {
        setInputAssetAmount(BN_ZERO)
        setOutputAssetAmount(BN_ZERO)
      }
      setIsConfirming(false)
    }
  }, [account?.id, swapTx, setIsConfirming])

  useEffect(() => {
    onChangeOutputAmount(BN_ZERO)
    onChangeInputAmount(BN_ZERO)
  }, [tradeDirection, onChangeOutputAmount, onChangeInputAmount])

  useEffect(() => {
    setOutputAssetAmount(BN_ZERO)
    setInputAssetAmount(BN_ZERO)
    setMarginChecked(isBorrowEnabled ? useMargin : false)
    setAutoRepayChecked(isRepayable ? useAutoRepay : false)
    simulateTrade(
      BNCoin.fromDenomAndBigNumber(inputAsset.denom, BN_ZERO),
      BNCoin.fromDenomAndBigNumber(outputAsset.denom, BN_ZERO),
      BNCoin.fromDenomAndBigNumber(inputAsset.denom, BN_ZERO),
      isAutoLendEnabled && !isAutoRepayChecked ? 'lend' : 'deposit',
      isAutoRepayChecked,
    )
  }, [
    isBorrowEnabled,
    isRepayable,
    useMargin,
    useAutoRepay,
    outputAsset.denom,
    inputAsset.denom,
    isAutoLendEnabled,
    isAutoRepayChecked,
    simulateTrade,
    setMarginChecked,
    setAutoRepayChecked,
  ])

  useEffect(() => {
    const removeDepositAmount = inputAssetAmount.isGreaterThanOrEqualTo(imputMarginThreshold)
      ? imputMarginThreshold
      : inputAssetAmount
    const addDebtAmount = inputAssetAmount.isGreaterThan(imputMarginThreshold)
      ? inputAssetAmount.minus(imputMarginThreshold)
      : BN_ZERO

    if (
      removeDepositAmount.isZero() &&
      addDebtAmount.isZero() &&
      outputAssetAmount.isZero() &&
      modal
    )
      return
    const removeCoin = BNCoin.fromDenomAndBigNumber(inputAsset.denom, removeDepositAmount)
    const addCoin = BNCoin.fromDenomAndBigNumber(outputAsset.denom, outputAssetAmount)
    const debtCoin = BNCoin.fromDenomAndBigNumber(inputAsset.denom, addDebtAmount)

    debouncedUpdateAccount(removeCoin, addCoin, debtCoin)
  }, [
    inputAssetAmount,
    outputAssetAmount,
    imputMarginThreshold,
    outputAsset.denom,
    inputAsset.denom,
    debouncedUpdateAccount,
    modal,
  ])

  const borrowMarket = useMemo(
    () => markets.find((market) => market.asset.denom === inputAsset.denom),
    [markets, inputAsset.denom],
  )

  useEffect(() => {
    if (inputAssetAmount.isEqualTo(maxInputAmount) || outputAssetAmount.isZero()) return
    if (outputAssetAmount.isEqualTo(maxOutputAmountEstimation)) setInputAssetAmount(maxInputAmount)
  }, [inputAssetAmount, maxInputAmount, outputAssetAmount, maxOutputAmountEstimation])

  const borrowAmount = useMemo(
    () =>
      inputAssetAmount.isGreaterThan(imputMarginThreshold)
        ? inputAssetAmount.minus(imputMarginThreshold)
        : BN_ZERO,
    [inputAssetAmount, imputMarginThreshold],
  )

  const availableLiquidity = useMemo(
    () => borrowMarket?.liquidity ?? BN_ZERO,
    [borrowMarket?.liquidity],
  )

  const isSwapDisabled = useMemo(
    () =>
      inputAssetAmount.isZero() ||
      depositCapReachedCoins.length > 0 ||
      borrowAmount.isGreaterThan(availableLiquidity),
    [inputAssetAmount, depositCapReachedCoins, borrowAmount, availableLiquidity],
  )

  return (
    <>
      <div className='flex flex-wrap w-full'>
        {isAdvanced ? (
          <AssetSelectorSingle buyAsset={outputAsset} sellAsset={inputAsset} />
        ) : (
          <AssetSelectorPair buyAsset={buyAsset} sellAsset={sellAsset} assets={assets} />
        )}
        <Divider />
        <MarginToggle
          checked={isMarginChecked}
          onChange={handleMarginToggleChange}
          disabled={!borrowMarket?.borrowEnabled}
          borrowAssetSymbol={inputAsset.symbol}
        />
        <Divider />
        {isRepayable && ENABLE_AUTO_REPAY && (
          <AutoRepayToggle
            checked={isAutoRepayChecked}
            onChange={handleAutoRepayToggleChange}
            buyAssetSymbol={outputAsset.symbol}
          />
        )}
        <div className='px-3'>
          <OrderTypeSelector selected={selectedOrderType} onChange={setSelectedOrderType} />
        </div>
        <div className='flex flex-col w-full gap-6 px-3 mt-6'>
          {isAdvanced ? (
            <AssetAmountInput
              label='Buy'
              max={maxOutputAmountEstimation}
              amount={outputAssetAmount}
              setAmount={onChangeOutputAmount}
              asset={outputAsset}
              maxButtonLabel='Max Amount:'
              disabled={isConfirming}
            />
          ) : (
            <>
              <TradeDirectionSelector
                direction={tradeDirection}
                onChangeDirection={setTradeDirection}
                asset={buyAsset}
              />
              <AssetAmountInput
                max={maxInputAmount}
                amount={inputAssetAmount}
                setAmount={onChangeInputAmount}
                asset={inputAsset}
                maxButtonLabel='Balance:'
                disabled={isConfirming}
              />
            </>
          )}

          {!isAdvanced && <Divider />}
          <LeverageSlider
            disabled={isConfirming || maxOutputAmountEstimation.isZero()}
            onChange={handleRangeInputChange}
            value={outputAssetAmount.shiftedBy(-outputAsset.decimals).toNumber()}
            max={maxOutputAmountEstimation.shiftedBy(-outputAsset.decimals).toNumber()}
            type='margin'
            marginThreshold={
              isMarginChecked
                ? outputSideMarginThreshold.shiftedBy(-outputAsset.decimals).toNumber()
                : undefined
            }
          />
          <DepositCapMessage
            action='buy'
            coins={depositCapReachedCoins}
            className='p-4 bg-white/5'
          />

          {borrowMarket && borrowAmount.isGreaterThanOrEqualTo(availableLiquidity) && (
            <AvailableLiquidityMessage market={borrowMarket} />
          )}
          {isAdvanced ? (
            <AssetAmountInput
              label='Sell'
              max={maxInputAmount}
              amount={inputAssetAmount}
              setAmount={onChangeInputAmount}
              asset={inputAsset}
              maxButtonLabel='Balance:'
              disabled={isConfirming}
            />
          ) : (
            <>
              <Divider />
              <div className='flex justify-between w-full'>
                <Text size='sm'>You receive</Text>
                <Text size='sm'>
                  {formatValue(outputAssetAmount.toNumber(), {
                    decimals: outputAsset.decimals,
                    abbreviated: false,
                    suffix: ` ${outputAsset.symbol}`,
                    minDecimals: 0,
                    maxDecimals: outputAsset.decimals,
                  })}
                </Text>
              </div>
            </>
          )}
        </div>
      </div>
      <div className='flex w-full px-3 pt-6'>
        <TradeSummary
          sellAsset={inputAsset}
          buyAsset={outputAsset}
          borrowRate={borrowMarket?.apy.borrow}
          buyAction={handleBuyClick}
          buyButtonDisabled={isSwapDisabled}
          showProgressIndicator={isConfirming}
          isMargin={isMarginChecked}
          borrowAmount={borrowAmount}
          estimatedFee={estimatedFee}
          liquidationPrice={liquidationPrice}
          sellAmount={inputAssetAmount}
          buyAmount={outputAssetAmount}
          isAdvanced={isAdvanced}
          direction={tradeDirection}
        />
      </div>
    </>
  )
}
