import BigNumber from 'bignumber.js'
import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Card from 'components/common/Card'
import LeverageSlider from 'components/common/LeverageSlider'
import { Spacer } from 'components/common/Spacer'
import Text from 'components/common/Text'
import { TradeDirectionSelector } from 'components/common/TradeDirectionSelector'
import { LeverageButtons } from 'components/perps/Module/LeverageButtons'
import { Or } from 'components/perps/Module/Or'
import PerpsSummary from 'components/perps/Module/Summary'
import usePerpsModule from 'components/perps/Module/usePerpsModule'
import AssetSelectorPerps from 'components/trade/TradeModule/AssetSelector/AssetSelectorPerps'
import AssetAmountInput from 'components/trade/TradeModule/SwapForm/AssetAmountInput'
import OrderTypeSelector from 'components/trade/TradeModule/SwapForm/OrderTypeSelector'
import { AvailableOrderType } from 'components/trade/TradeModule/SwapForm/OrderTypeSelector/types'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAllAssets from 'hooks/assets/useAllAssets'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import usePerpsConfig from 'hooks/perps/usePerpsConfig'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import useHealthComputer from 'hooks/useHealthComputer'
import usePrice from 'hooks/usePrice'
import usePrices from 'hooks/usePrices'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import { getAccountNetValue } from 'utils/accounts'
import { demagnify } from 'utils/formatters'
import getPerpsPosition from 'utils/getPerpsPosition'
import { BN } from 'utils/helpers'

export function PerpsModule() {
  const [selectedOrderType, setSelectedOrderType] = useState<AvailableOrderType>('Market')
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('long')
  const { data: perpsVault } = usePerpsVault()
  const { perpsAsset } = usePerpsAsset()
  const account = useCurrentAccount()
  const { data: prices } = usePrices()
  const allAssets = useAllAssets()
  const { simulatePerps, updatedPerpPosition, updatedAccount, removedDeposits } =
    useUpdatedAccount(account)
  const [amount, setAmount] = useState<BigNumber>(BN_ZERO)
  const { previousAmount, previousTradeDirection, previousLeverage, leverage, hasActivePosition } =
    usePerpsModule(amount)

  const [sliderLeverage, setSliderLeverage] = useState<number>(1)

  const { computeMaxPerpAmount } = useHealthComputer(account)

  const { data: tradingFee } = useTradingFeeAndPrice(
    perpsAsset.denom,
    amount.plus(previousAmount),
    previousAmount,
  )
  const perpsOraclePrice = usePrice(perpsAsset.denom)
  const { data: perpsConfig } = usePerpsConfig()

  const debouncedUpdateAccount = useMemo(
    () =>
      debounce((perpsPosition: PerpsPosition) => {
        if (
          !!updatedPerpPosition &&
          perpsPosition.amount.isEqualTo(updatedPerpPosition.amount) &&
          perpsPosition.tradeDirection === updatedPerpPosition.tradeDirection
        )
          return

        simulatePerps(perpsPosition)
      }, 500),
    [simulatePerps, updatedPerpPosition],
  )

  useEffect(() => {
    const currentPerpPosition = account?.perps.find((p) => p.denom === perpsAsset.denom)
    if (!perpsConfig || !tradingFee || !perpsVault) return

    const perpsPosition = getPerpsPosition(
      perpsVault.denom,
      perpsAsset,
      amount.plus(previousAmount),
      tradeDirection ?? previousTradeDirection,
      perpsConfig,
      tradingFee,
      currentPerpPosition,
    )

    debouncedUpdateAccount(perpsPosition)
  }, [
    debouncedUpdateAccount,
    amount,
    perpsAsset,
    tradeDirection,
    previousAmount,
    previousTradeDirection,
    perpsConfig,
    tradingFee,
    perpsVault,
    account?.perps,
    perpsOraclePrice,
  ])

  const netValue = useMemo(() => {
    if (!account) return BN_ZERO

    return getAccountNetValue(account, prices, allAssets)
  }, [account, allAssets, prices])

  const [maxAmount, maxLeverage] = useMemo(() => {
    let maxAmount = computeMaxPerpAmount(perpsAsset.denom, tradeDirection)

    if (tradeDirection === 'short') maxAmount = maxAmount.plus(previousAmount)
    if (tradeDirection === 'long') maxAmount = maxAmount.minus(previousAmount)

    maxAmount = BigNumber.max(maxAmount, 0)
    let maxLeverage = 1

    if (!hasActivePosition) {
      maxLeverage = perpsOraclePrice
        .times(demagnify(maxAmount, perpsAsset))
        .div(netValue)
        .plus(1)
        .toNumber()
    }

    return [maxAmount, maxLeverage]
  }, [
    computeMaxPerpAmount,
    hasActivePosition,
    netValue,
    perpsAsset,
    perpsOraclePrice,
    previousAmount,
    tradeDirection,
  ])

  const onDebounce = useCallback(() => {
    const percentOfMax = BN(sliderLeverage - 1).div(maxLeverage - 1)
    setAmount(maxAmount.times(percentOfMax).integerValue())
  }, [maxAmount, maxLeverage, sliderLeverage])

  const onChangeTradeDirection = useCallback(
    (tradeDirection: TradeDirection) => {
      setAmount(amount.times(-1))
      setTradeDirection(tradeDirection)
    },
    [amount],
  )

  const onChangeAmount = useCallback(
    (amount: BigNumber) => {
      if (tradeDirection === 'short') {
        setAmount(amount.times(-1))
        return
      }

      setAmount(amount)
    },
    [tradeDirection],
  )

  if (!perpsAsset) return null

  return (
    <Card
      contentClassName='px-4 gap-5 flex flex-col h-full pb-4'
      title={<AssetSelectorPerps asset={perpsAsset} hasActivePosition={hasActivePosition} />}
      className='h-full mb-4'
    >
      <OrderTypeSelector selected={selectedOrderType} onChange={setSelectedOrderType} />
      <TradeDirectionSelector
        direction={tradeDirection}
        onChangeDirection={onChangeTradeDirection}
      />
      <AssetAmountInput
        label='Amount'
        max={maxAmount}
        amount={amount.abs()}
        setAmount={onChangeAmount}
        asset={perpsAsset}
        maxButtonLabel='Max:'
        disabled={false}
      />
      {!hasActivePosition && (
        <>
          <Or />
          <Text size='sm'>Position Leverage</Text>
          <LeverageSlider
            min={1}
            max={maxLeverage}
            value={sliderLeverage}
            onChange={setSliderLeverage}
            onDebounce={onDebounce}
            type={tradeDirection}
          />
          <LeverageButtons
            maxLeverage={maxLeverage}
            currentLeverage={leverage}
            maxAmount={maxAmount}
            onChange={(leverage) => {
              const percentOfMax = BN(leverage - 1).div(maxLeverage - 1)
              setAmount(maxAmount.times(percentOfMax).integerValue())
              setSliderLeverage(leverage)
            }}
          />
        </>
      )}

      <Spacer />
      <PerpsSummary
        amount={amount ?? previousAmount}
        tradeDirection={tradeDirection ?? previousTradeDirection}
        asset={perpsAsset}
        leverage={leverage}
        previousAmount={previousAmount}
        previousTradeDirection={previousTradeDirection}
        previousLeverage={previousLeverage}
        hasActivePosition={hasActivePosition}
        onTxExecuted={() => setAmount(BN_ZERO)}
      />
    </Card>
  )
}
