import { useCallback, useEffect, useMemo, useState } from 'react'

import AssetAmountInput from 'components/common/AssetAmountInput'
import AvailableLiquidityMessage from 'components/common/AvailableLiquidityMessage'
import { CircularProgress } from 'components/common/CircularProgress'
import DepositCapMessage from 'components/common/DepositCapMessage'
import Divider from 'components/common/Divider'
import LeverageSlider from 'components/common/LeverageSlider'
import OrderTypeSelector from 'components/common/OrderTypeSelector'
import Text from 'components/common/Text'
import { TradeDirectionSelector } from 'components/common/TradeDirectionSelector'
import AssetSelectorPair from 'components/trade/TradeModule/AssetSelector/AssetSelectorPair'
import AssetSelectorSingle from 'components/trade/TradeModule/AssetSelector/AssetSelectorSingle'
import AutoRepayToggle from 'components/trade/TradeModule/SwapForm/AutoRepayToggle'
import { ORDER_TYPE_TABS } from 'components/trade/TradeModule/SwapForm/constants'
import MarginToggle from 'components/trade/TradeModule/SwapForm/MarginToggle'
import TradeSummary from 'components/trade/TradeModule/SwapForm/TradeSummary'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useTradeEnabledAssets from 'hooks/assets/useTradeEnabledAssets'
import useToggle from 'hooks/common/useToggle'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useMarkets from 'hooks/markets/useMarkets'
import useRouteInfo from 'hooks/trade/useRouteInfo'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { OrderType } from 'types/enums'
import { byDenom } from 'utils/array'
import { ENABLE_AUTO_REPAY } from 'utils/constants'
import { formatValue, getCoinValue } from 'utils/formatters'
import { getCapLeftWithBuffer } from 'utils/generic'
import { BN } from 'utils/helpers'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  isAdvanced: boolean
  chainConfig: ChainConfig
}

export default function SwapForm(props: Props) {
  const { buyAsset, sellAsset, isAdvanced, chainConfig } = props
  const useMargin = useStore((s) => s.useMargin)
  const useAutoRepay = useStore((s) => s.useAutoRepay)
  const account = useCurrentAccount()
  const swap = useStore((s) => s.swap)
  const [slippage] = useLocalStorage(
    LocalStorageKeys.SLIPPAGE,
    getDefaultChainSettings(chainConfig).slippage,
  )
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
  const [inputAssetAmount, setInputAssetAmount] = useState(BN_ZERO)
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>(OrderType.MARKET)
  const [isConfirming, setIsConfirming] = useToggle()
  const { isAutoLendEnabledForCurrentAccount: isAutoLendEnabled } = useAutoLend()
  const modal = useStore<string | null>((s) => s.fundAndWithdrawModal)
  const { simulateTrade, removedLends, updatedAccount } = useUpdatedAccount(account)
  const { computeLiquidationPrice } = useHealthComputer(updatedAccount ?? account)
  const assets = useTradeEnabledAssets()

  const { data: routeInfo } = useRouteInfo(inputAsset.denom, outputAsset.denom, inputAssetAmount)

  const outputAssetAmount = useMemo(() => {
    return routeInfo?.amountOut || BN_ZERO
  }, [routeInfo])

  const depositCapReachedCoins: BNCoin[] = useMemo(() => {
    const outputMarketAsset = markets.find((market) => market.asset.denom === outputAsset.denom)

    if (!outputMarketAsset || !outputMarketAsset.cap) return []

    let depositCapLeft = getCapLeftWithBuffer(outputMarketAsset.cap)
    if (isAutoRepayChecked && account) {
      const debtAmount = account.debts.find(byDenom(outputAsset.denom))?.amount ?? BN_ZERO
      depositCapLeft = depositCapLeft.plus(debtAmount)
    }
    if (outputAssetAmount.isGreaterThan(depositCapLeft)) {
      return [BNCoin.fromDenomAndBigNumber(outputAsset.denom, depositCapLeft)]
    }

    return []
  }, [account, isAutoRepayChecked, markets, outputAsset.denom, outputAssetAmount])

  const handleRangeInputChange = useCallback(
    (value: number) => {
      setInputAssetAmount(BN(value).shiftedBy(inputAsset.decimals).integerValue())
    },
    [setInputAssetAmount, inputAsset.decimals],
  )

  const [maxInputAmount, inputMarginThreshold] = useMemo(() => {
    const maxAmount = computeMaxSwapAmount(inputAsset, outputAsset, 'default', isAutoRepayChecked)
    const maxAmountOnMargin = computeMaxSwapAmount(
      inputAsset,
      outputAsset,
      'margin',
      isAutoRepayChecked,
    ).integerValue()

    if (isMarginChecked) return [maxAmountOnMargin, maxAmount]

    if (inputAssetAmount.isGreaterThan(maxAmount)) setInputAssetAmount(maxAmount)

    return [maxAmount, maxAmount]
  }, [
    computeMaxSwapAmount,
    inputAsset,
    outputAsset,
    isMarginChecked,
    inputAssetAmount,
    setInputAssetAmount,
    isAutoRepayChecked,
  ])

  const swapTx = useMemo(() => {
    if (!routeInfo) return

    const borrowCoin = inputAssetAmount.isGreaterThan(inputMarginThreshold)
      ? BNCoin.fromDenomAndBigNumber(inputAsset.denom, inputAssetAmount.minus(inputMarginThreshold))
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
      routeInfo,
    })
  }, [
    routeInfo,
    inputAssetAmount,
    inputMarginThreshold,
    inputAsset.denom,
    swap,
    account?.id,
    removedLends,
    outputAsset.denom,
    slippage,
    maxInputAmount,
    isAutoRepayChecked,
  ])

  const updateAccount = useCallback(
    (removeCoin: BNCoin, addCoin: BNCoin, debtCoin: BNCoin, isBorrowEnabled: boolean) => {
      if (addCoin.amount.isZero()) {
        simulateTrade(
          BNCoin.fromDenomAndBigNumber(inputAsset.denom, BN_ZERO),
          BNCoin.fromDenomAndBigNumber(outputAsset.denom, BN_ZERO),
          BNCoin.fromDenomAndBigNumber(inputAsset.denom, BN_ZERO),
          isAutoLendEnabled && isBorrowEnabled && !isAutoRepayChecked ? 'lend' : 'deposit',
          isAutoRepayChecked,
        )
      } else {
        simulateTrade(
          removeCoin,
          addCoin,
          debtCoin,
          isAutoLendEnabled && isBorrowEnabled && !isAutoRepayChecked ? 'lend' : 'deposit',
          isAutoRepayChecked,
        )
      }
    },
    [simulateTrade, inputAsset.denom, outputAsset.denom, isAutoLendEnabled, isAutoRepayChecked],
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

  const liquidationPrice = useMemo(() => {
    if (!outputAsset.isWhitelisted) return 0

    const debtAmount = account?.debts.find(byDenom(outputAsset.denom))?.amount ?? BN_ZERO
    if (isAutoRepayChecked && outputAssetAmount.isLessThan(debtAmount))
      return computeLiquidationPrice(outputAsset.denom, 'debt')
    if (isAutoRepayChecked && outputAssetAmount.isEqualTo(debtAmount)) return 0
    return computeLiquidationPrice(outputAsset.denom, 'asset')
  }, [
    account?.debts,
    computeLiquidationPrice,
    isAutoRepayChecked,
    outputAsset.denom,
    outputAsset.isWhitelisted,
    outputAssetAmount,
  ])

  const handleBuyClick = useCallback(async () => {
    if (account?.id) {
      setIsConfirming(true)

      const isSucceeded = await swapTx?.execute()

      if (isSucceeded) {
        setInputAssetAmount(BN_ZERO)
      }
      setIsConfirming(false)
    }
  }, [account?.id, swapTx, setIsConfirming])

  const changeTradeDirection = useCallback(
    (direction: TradeDirection) => {
      setInputAssetAmount(BN_ZERO)
      setTradeDirection(direction)
    },
    [setInputAssetAmount],
  )

  useEffect(() => {
    setMarginChecked(isBorrowEnabled ? useMargin : false)
    setAutoRepayChecked(isRepayable ? useAutoRepay : false)
    simulateTrade(
      BNCoin.fromDenomAndBigNumber(inputAsset.denom, BN_ZERO),
      BNCoin.fromDenomAndBigNumber(outputAsset.denom, BN_ZERO),
      BNCoin.fromDenomAndBigNumber(inputAsset.denom, BN_ZERO),
      isAutoLendEnabled && outputAsset.isBorrowEnabled && !isAutoRepayChecked ? 'lend' : 'deposit',
      isAutoRepayChecked,
    )
  }, [
    isBorrowEnabled,
    isRepayable,
    useMargin,
    useAutoRepay,
    outputAsset.denom,
    outputAsset.isBorrowEnabled,
    inputAsset.denom,
    isAutoLendEnabled,
    isAutoRepayChecked,
    simulateTrade,
    setMarginChecked,
    setAutoRepayChecked,
  ])

  useEffect(() => {
    const removeDepositAmount = inputAssetAmount.isGreaterThanOrEqualTo(inputMarginThreshold)
      ? inputMarginThreshold
      : inputAssetAmount
    const addDebtAmount = inputAssetAmount.isGreaterThan(inputMarginThreshold)
      ? inputAssetAmount.minus(inputMarginThreshold)
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

    updateAccount(removeCoin, addCoin, debtCoin, outputAsset.isBorrowEnabled ?? true)
  }, [
    inputAssetAmount,
    outputAssetAmount,
    inputMarginThreshold,
    outputAsset.denom,
    outputAsset.isBorrowEnabled,
    inputAsset.denom,
    updateAccount,
    modal,
  ])

  const borrowMarket = useMemo(
    () => markets.find((market) => market.asset.denom === inputAsset.denom),
    [markets, inputAsset.denom],
  )

  const borrowAmount = useMemo(
    () =>
      inputAssetAmount.isGreaterThan(inputMarginThreshold)
        ? inputAssetAmount.minus(inputMarginThreshold)
        : BN_ZERO,
    [inputAssetAmount, inputMarginThreshold],
  )

  const availableLiquidity = useMemo(
    () => borrowMarket?.liquidity ?? BN_ZERO,
    [borrowMarket?.liquidity],
  )

  const isSwapDisabled = useMemo(
    () =>
      inputAssetAmount.isZero() ||
      depositCapReachedCoins.length > 0 ||
      borrowAmount.isGreaterThan(availableLiquidity) ||
      !routeInfo,
    [inputAssetAmount, depositCapReachedCoins.length, borrowAmount, availableLiquidity, routeInfo],
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
          <OrderTypeSelector
            orderTabs={ORDER_TYPE_TABS}
            selected={selectedOrderType}
            onChange={setSelectedOrderType}
          />
        </div>
        <div className='flex flex-col w-full gap-6 px-3 mt-6'>
          {!isAdvanced && (
            <TradeDirectionSelector
              direction={tradeDirection}
              onChangeDirection={changeTradeDirection}
              asset={buyAsset}
            />
          )}
          <AssetAmountInput
            max={maxInputAmount}
            amount={inputAssetAmount}
            setAmount={setInputAssetAmount}
            asset={inputAsset}
            maxButtonLabel='Balance:'
            disabled={isConfirming}
          />
          <Divider />
          <LeverageSlider
            disabled={isConfirming || maxInputAmount.isZero()}
            onChange={handleRangeInputChange}
            value={inputAssetAmount.shiftedBy(-inputAsset.decimals).toNumber()}
            max={maxInputAmount.shiftedBy(-inputAsset.decimals).toNumber()}
            type='margin'
            marginThreshold={
              isMarginChecked
                ? inputMarginThreshold.shiftedBy(-inputAsset.decimals).toNumber()
                : undefined
            }
          />
          <DepositCapMessage
            action='buy'
            coins={depositCapReachedCoins}
            className='p-4 bg-white/5'
          />

          {isMarginChecked &&
            borrowMarket &&
            borrowAmount.isGreaterThanOrEqualTo(availableLiquidity) && (
              <AvailableLiquidityMessage market={borrowMarket} />
            )}
          <Divider />
          <div className='flex justify-between w-full'>
            <Text size='sm'>You receive</Text>
            {!inputAssetAmount.isZero() && outputAssetAmount.isZero() ? (
              <CircularProgress size={14} />
            ) : (
              <div className='flex items-center gap-1 flex-nowrap whitespace-nowrap'>
                <Text size='sm'>
                  {formatValue(outputAssetAmount.toNumber(), {
                    decimals: outputAsset.decimals,
                    abbreviated: false,
                    suffix: ` ${outputAsset.symbol}`,
                    minDecimals: 0,
                    maxDecimals: outputAsset.decimals,
                  })}
                </Text>
                {!outputAssetAmount.isZero() && outputAsset.price && (
                  <Text size='sm' className='text-white/60'>
                    {` (${formatValue(
                      getCoinValue(
                        BNCoin.fromDenomAndBigNumber(outputAsset.denom, outputAssetAmount),
                        [outputAsset],
                      ).toNumber(),
                      {
                        prefix: '$',
                        maxDecimals: 2,
                        abbreviated: true,
                      },
                    )})`}
                  </Text>
                )}
              </div>
            )}
          </div>
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
          liquidationPrice={liquidationPrice}
          isAdvanced={isAdvanced}
          direction={tradeDirection}
          routeInfo={routeInfo}
          inputAmount={inputAssetAmount}
        />
      </div>
    </>
  )
}
