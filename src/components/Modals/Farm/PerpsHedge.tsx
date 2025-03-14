import { useCallback, useEffect, useMemo, useState } from 'react'

import AssetAmountInput from 'components/common/AssetAmountInput'
import { Callout, CalloutType } from 'components/common/Callout'

import Button from 'components/common/Button'

import { BN_ZERO } from 'constants/math'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { BNCoin } from 'types/classes/BNCoin'

import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useAssets from 'hooks/assets/useAssets'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { usePerpsOrderForm } from 'hooks/perps/usePerpsOrderForm'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import useAutoLend from 'hooks/wallet/useAutoLend'
import usePerpsModule from 'components/perps/Module/usePerpsModule'
import { useExecutionState } from 'hooks/perps/useExecutionState'
import { usePerpsCallbacks } from 'hooks/perps/usePerpsCallbacks'
import getPerpsPosition from 'utils/getPerpsPosition'
import { getEnterAstroLpActions } from 'utils/astroLps'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

interface PerpsHedgeProps {
  lpAddress: string
  depositCoins: BNCoin[]
  borrowCoins: BNCoin[]
  onChangeDeposits?: (coins: BNCoin[]) => void
  onChangeBorrowings?: (coins: BNCoin[]) => void
}

export function PerpsHedge(props: PerpsHedgeProps) {
  const tradeDirection = 'short'
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationKey, setSimulationKey] = useState(0)
  const [showCombinedSimulation, setShowCombinedSimulation] = useState(false)
  const [enableHedge, setEnableHedge] = useState(true)
  const [userHasEditedAmount, setUserHasEditedAmount] = useState(false)

  const isLimitOrder = false
  const isStopOrder = false

  const { data: perpsVault } = usePerpsVault()
  const { perpsAsset } = usePerpsAsset()
  const account = useCurrentAccount()
  const updatedAccount = useStore((s) => s.updatedAccount)
  const { data: assets } = useAssets()
  const { simulatePerps, updatedPerpPosition, simulateAstroLpDeposit, leverage } =
    useUpdatedAccount(account)
  const updatedAccountUtils = useUpdatedAccount(account)
  const simulateHedge = updatedAccountUtils['simulateHedge'] as (
    address: string,
    coins: BNCoin[],
    borrowCoins: BNCoin[],
  ) => void
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()

  const { limitPrice, setLimitPrice, setStopPrice, stopPrice } = usePerpsOrderForm()
  const {
    maxLeverage,
    maxAmount,
    isMaxSelected,
    amount,
    warningMessages,
    updateAmount,
    updateLeverage,
    previousAmount,
  } = usePerpsModule(tradeDirection, isLimitOrder ? limitPrice : null, isStopOrder)
  const { data: tradingFee } = useTradingFeeAndPrice(perpsAsset.denom, amount.plus(previousAmount))
  const currentPerpPosition = account?.perps.find(byDenom(perpsAsset.denom))

  const suggestedHedgeAmount = useMemo(() => {
    if (!props.depositCoins.length || !assets?.length || !perpsAsset) {
      return BN_ZERO
    }

    const totalDepositValue = props.depositCoins.reduce((acc, coin) => {
      const asset = assets.find(byDenom(coin.denom))
      if (!asset || !asset.price) return acc
      return acc.plus(coin.amount.shiftedBy(-asset.decimals).times(asset.price.amount))
    }, BN_ZERO)

    const totalBorrowValue = props.borrowCoins.reduce((acc, coin) => {
      const asset = assets.find(byDenom(coin.denom))
      if (!asset || !asset.price) return acc
      return acc.plus(coin.amount.shiftedBy(-asset.decimals).times(asset.price.amount))
    }, BN_ZERO)

    const totalValue = totalDepositValue.plus(totalBorrowValue)

    const hedgeValueNeeded = totalValue.div(2)

    if (!perpsAsset.price || perpsAsset.price.amount.isZero()) {
      return BN_ZERO
    }

    const hedgeAmount = hedgeValueNeeded.div(perpsAsset.price.amount).shiftedBy(perpsAsset.decimals)

    return hedgeAmount.integerValue()
  }, [props.depositCoins, props.borrowCoins, assets, perpsAsset])

  const { onChangeAmount } = usePerpsCallbacks({
    updateAmount,
    updateLeverage,
    simulatePerps,
    currentPerpPosition,
    isAutoLendEnabledForCurrentAccount,
    isStopOrder,
    tradeDirection,
    maxLeverage,
    setLimitPrice,
    setStopPrice,
  })

  const handleAmountChange = useCallback(
    (newAmount: BigNumber) => {
      setUserHasEditedAmount(true)
      onChangeAmount(newAmount)
    },
    [onChangeAmount],
  )

  useEffect(() => {
    if (!suggestedHedgeAmount.isZero() && enableHedge && !userHasEditedAmount) {
      onChangeAmount(suggestedHedgeAmount)
    }
  }, [suggestedHedgeAmount, enableHedge, onChangeAmount, userHasEditedAmount])

  useEffect(() => {
    setUserHasEditedAmount(false)
  }, [props.depositCoins])

  useEffect(() => {
    if (!isSimulating || !tradingFee || !perpsVault) return
    if (isLimitOrder || isStopOrder) return
    if (amount.isZero() && (!currentPerpPosition || currentPerpPosition.amount.isZero())) return

    const newAmount = currentPerpPosition?.amount.plus(amount) ?? amount
    const previousTradeDirection = currentPerpPosition?.amount.isLessThan(0) ? 'short' : 'long'
    const newTradeDirection = newAmount.isLessThan(0) ? 'short' : 'long'

    const updatedTradeDirection = newAmount.isZero() ? previousTradeDirection : newTradeDirection

    const newPosition = getPerpsPosition(
      perpsVault.denom,
      perpsAsset,
      newAmount,
      updatedTradeDirection,
      tradingFee,
      currentPerpPosition,
      limitPrice,
    )

    simulatePerps(newPosition)
  }, [
    isSimulating,
    tradingFee,
    perpsVault,
    amount,
    currentPerpPosition,
    perpsAsset,
    limitPrice,
    simulatePerps,
    isLimitOrder,
    isStopOrder,
  ])

  const { isDisabledAmountInput } = useExecutionState({
    amount,
    maxAmount,
    warningMessages: warningMessages.value,
    isStopOrder,
    stopPrice,
    perpsAsset,
    isLimitOrder,
    limitPrice,
  })

  const runAstroLpSimulation = useCallback(() => {
    if (!props.lpAddress || !props.depositCoins.length) return

    if (props.onChangeDeposits) {
      props.onChangeDeposits(props.depositCoins)

      if (props.onChangeBorrowings && props.borrowCoins.length > 0) {
        props.onChangeBorrowings(props.borrowCoins)
      }
    } else {
      simulateAstroLpDeposit(props.lpAddress, props.depositCoins, props.borrowCoins)
    }

    setIsSimulating(true)
    setShowCombinedSimulation(false)
    setSimulationKey((prev) => prev + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.onChangeDeposits,
    props.onChangeBorrowings,
    simulateAstroLpDeposit,
    props.lpAddress,
    props.depositCoins,
    props.borrowCoins,
  ])

  const runCombinedSimulation = useCallback(() => {
    if (!props.lpAddress || !props.depositCoins.length || !tradingFee || !perpsVault) return
    if (amount.isZero() && (!currentPerpPosition || currentPerpPosition.amount.isZero())) return

    simulateHedge(props.lpAddress, props.depositCoins, props.borrowCoins)

    setIsSimulating(true)
    setShowCombinedSimulation(true)
    setSimulationKey((prev) => prev + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.lpAddress,
    props.depositCoins,
    props.borrowCoins,
    tradingFee,
    perpsVault,
    amount,
    currentPerpPosition,
  ])

  const getBorrowingsFromAccount = useCallback((): BNCoin[] => {
    if (!updatedAccount) return props.borrowCoins

    return props.borrowCoins
  }, [updatedAccount, props.borrowCoins])

  useEffect(() => {
    if (enableHedge && props.lpAddress && props.depositCoins.length > 0 && !isSimulating) {
      runAstroLpSimulation()
    } else if (!enableHedge && isSimulating) {
      simulatePerps(undefined)
      setIsSimulating(false)
      setShowCombinedSimulation(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enableHedge,
    props.lpAddress,
    props.depositCoins,
    props.borrowCoins,
    runAstroLpSimulation,
    simulatePerps,
  ])

  useEffect(() => {
    if (
      enableHedge &&
      props.lpAddress &&
      props.depositCoins.length > 0 &&
      !amount.isZero() &&
      tradingFee &&
      perpsVault &&
      isSimulating &&
      !showCombinedSimulation
    ) {
      runCombinedSimulation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enableHedge,
    props.lpAddress,
    props.depositCoins,
    props.borrowCoins,
    amount,
    tradingFee,
    perpsVault,
    showCombinedSimulation,
    runCombinedSimulation,
  ])

  useEffect(() => {
    if (isSimulating && !showCombinedSimulation) {
      if (props.onChangeDeposits && props.depositCoins.length > 0) {
        props.onChangeDeposits(props.depositCoins)
      }

      if (props.onChangeBorrowings && props.borrowCoins.length > 0) {
        props.onChangeBorrowings(props.borrowCoins)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.onChangeDeposits,
    props.onChangeBorrowings,
    props.depositCoins,
    props.borrowCoins,
    isSimulating,
    showCombinedSimulation,
  ])

  useEffect(() => {
    return () => {
      if (isSimulating) {
        simulatePerps(undefined)
        setIsSimulating(false)
      }
    }
  }, [simulatePerps, isSimulating])

  if (!perpsAsset) return null

  if (!enableHedge) {
    return (
      <div className='p-4 px-3 h-auto flex flex-grow flex-col justify-between h-full'>
        <div className='flex items-center justify-between mb-4'>
          <div className='text-lg font-medium'>Add Hedge Position</div>
          <label className='inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={enableHedge}
              onChange={() => setEnableHedge(!enableHedge)}
              className='sr-only peer'
            />
            <div className='relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600'></div>
          </label>
        </div>
        <div className='text-white/60 text-sm mb-4'>
          Enable a hedge position to protect against price volatility in your LP position.
        </div>
        <Button onClick={() => setEnableHedge(true)} className='w-full'>
          Enable Hedge Position
        </Button>
      </div>
    )
  }

  return (
    <div
      className='p-4 px-3 h-auto flex flex-grow flex-col justify-between h-full'
      key={`simulation-${simulationKey}`}
    >
      <div className='flex flex-col gap-5'>
        <div className='flex items-center justify-between mb-2'>
          <div className='text-lg font-medium'>Hedge Position</div>
          <label className='inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={enableHedge}
              onChange={() => setEnableHedge(!enableHedge)}
              className='sr-only peer'
            />
            <div className='relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600'></div>
          </label>
        </div>

        {suggestedHedgeAmount.isGreaterThan(0) && (
          <div className='text-sm text-white/80 mb-2'>
            Suggested hedge amount:{' '}
            {suggestedHedgeAmount.shiftedBy(-perpsAsset.decimals).toString()} {perpsAsset.symbol}{' '}
            (based on LP deposit)
          </div>
        )}

        <AssetAmountInput
          containerClassName='pb-2'
          label='Amount'
          max={maxAmount}
          amount={amount.abs()}
          setAmount={handleAmountChange}
          asset={perpsAsset}
          maxButtonLabel='Max:'
          disabled={isDisabledAmountInput}
          isMaxSelected={isMaxSelected}
          capMax={false}
        />
        {amount.isGreaterThan(maxAmount) && (
          <Callout type={CalloutType.WARNING}>
            The entered amount exceeds the maximum allowed.
          </Callout>
        )}

        {enableHedge && props.lpAddress && props.depositCoins.length > 0 && (
          <div className='text-sm text-white/60 mb-2'>
            LP position simulation is automatically shown when hedge is enabled.
            {props.borrowCoins.length > 0 && ' Includes borrowed assets.'}
            {amount.isGreaterThan(0) &&
              ` Combined with ${amount.shiftedBy(-perpsAsset.decimals).toString()} ${perpsAsset.symbol} ${tradeDirection} hedge.`}
          </div>
        )}

        {isSimulating && (
          <>
            <Button
              onClick={() => {
                if (
                  amount.isZero() ||
                  !props.lpAddress ||
                  !props.depositCoins.length ||
                  !tradingFee ||
                  !perpsVault ||
                  !account ||
                  !account.id
                ) {
                  return
                }

                const store = useStore.getState()
                const { depositLpAndHedge } = store

                let lpActions: Action[] = []
                const astroLp = assets?.find(byDenom(props.lpAddress))
                if (astroLp && astroLp.poolInfo) {
                  const primaryCoin =
                    props.depositCoins.find(
                      (coin) => coin.denom === astroLp.poolInfo?.assets.primary.denom,
                    ) ||
                    BNCoin.fromDenomAndBigNumber(astroLp.poolInfo.assets.primary.denom, BN_ZERO)

                  const secondaryCoin =
                    props.depositCoins.find(
                      (coin) => coin.denom === astroLp.poolInfo?.assets.secondary.denom,
                    ) ||
                    BNCoin.fromDenomAndBigNumber(astroLp.poolInfo.assets.secondary.denom, BN_ZERO)

                  lpActions = getEnterAstroLpActions(
                    {
                      denoms: {
                        primary: astroLp.poolInfo.assets.primary.denom,
                        secondary: astroLp.poolInfo.assets.secondary.denom,
                        lp: astroLp.denom,
                        astroLp: astroLp.poolInfo.address,
                      },
                    } as any,
                    primaryCoin,
                    secondaryCoin,
                    0.5,
                  )
                }

                depositLpAndHedge({
                  accountId: account.id,
                  lpActions: lpActions,
                  depositCoins: props.depositCoins,
                  borrowCoins: props.borrowCoins,
                  perpCoin: BNCoin.fromDenomAndBigNumber(perpsAsset.denom, amount),
                  autolend: isAutoLendEnabledForCurrentAccount,
                  baseDenom: perpsVault.denom,
                })

                setIsSimulating(false)
                setShowCombinedSimulation(false)
                simulatePerps(undefined)
              }}
              className='w-full mt-2'
              variant='solid'
            >
              Deposit LP Hedged
            </Button>

            {!showCombinedSimulation && (
              <div className='p-3 mt-2 bg-white/5 rounded-base'>
                <div className='text-sm font-medium mb-2'>LP Position Simulation:</div>

                {props.depositCoins.length > 0 && (
                  <div className='mb-2'>
                    <div className='text-xs text-white/70 mb-1'>Deposited Assets:</div>
                    {props.depositCoins.map((coin) => {
                      const asset = assets?.find(byDenom(coin.denom))
                      return asset ? (
                        <div key={coin.denom} className='text-xs flex justify-between items-center'>
                          <span>{asset.symbol}</span>
                          <span>{coin.amount.shiftedBy(-asset.decimals).toString()}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                )}

                {props.borrowCoins.length > 0 && (
                  <div className='mb-2'>
                    <div className='text-xs text-white/70 mb-1'>Borrowed Assets:</div>
                    {getBorrowingsFromAccount().map((coin) => {
                      const asset = assets?.find(byDenom(coin.denom))
                      return asset ? (
                        <div key={coin.denom} className='text-xs flex justify-between items-center'>
                          <span>{asset.symbol}</span>
                          <span>{coin.amount.shiftedBy(-asset.decimals).toString()}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                )}

                {updatedPerpPosition && (
                  <div className='mt-2 pt-2 border-t border-white/10'>
                    <div className='text-xs text-white/70 mb-1'>Hedge Position:</div>
                    <div className='text-xs flex justify-between mb-1'>
                      <span>Direction:</span>
                      <span
                        className={
                          updatedPerpPosition.tradeDirection === 'long'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }
                      >
                        {updatedPerpPosition.tradeDirection.toUpperCase()}
                      </span>
                    </div>
                    <div className='text-xs flex justify-between mb-1'>
                      <span>Size:</span>
                      <span>
                        {updatedPerpPosition.amount
                          .abs()
                          .shiftedBy(-perpsAsset.decimals)
                          .toString()}{' '}
                        {perpsAsset.symbol}
                      </span>
                    </div>
                    <div className='text-xs flex justify-between'>
                      <span>Entry Price:</span>
                      <span>${updatedPerpPosition.entryPrice.toString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showCombinedSimulation && updatedAccount && (
              <div className='p-3 mt-2 bg-white/5 rounded-base'>
                <div className='text-sm font-medium mb-2'>Combined Simulation Results:</div>

                {/* LP Position */}
                {updatedAccount.stakedAstroLps.length > 0 && (
                  <div className='mb-2'>
                    <div className='text-xs text-white/70 mb-1'>LP Position:</div>
                    <div className='text-xs flex justify-between mb-1'>
                      <span>Pool:</span>
                      <span>{updatedAccount.stakedAstroLps[0].denom.split('gamm/pool/')[1]}</span>
                    </div>
                    <div className='text-xs flex justify-between mb-1'>
                      <span>Amount:</span>
                      <span>{updatedAccount.stakedAstroLps[0].amount.toString()}</span>
                    </div>
                  </div>
                )}

                {/* Borrowed assets */}
                {props.borrowCoins.length > 0 && (
                  <div className='mb-2'>
                    <div className='text-xs text-white/70 mb-1'>Borrowed Assets:</div>
                    {getBorrowingsFromAccount().map((coin) => {
                      const asset = assets?.find(byDenom(coin.denom))
                      return asset ? (
                        <div key={coin.denom} className='text-xs flex justify-between items-center'>
                          <span>{asset.symbol}</span>
                          <span>{coin.amount.shiftedBy(-asset.decimals).toString()}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                )}

                {/* Perps Position */}
                {updatedAccount.perps.length > 0 && (
                  <div className='mb-2'>
                    <div className='text-xs text-white/70 mb-1'>Hedge Position:</div>
                    <div className='text-xs flex justify-between mb-1'>
                      <span>Direction:</span>
                      <span
                        className={
                          updatedAccount.perps[0].tradeDirection === 'long'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }
                      >
                        {updatedAccount.perps[0].tradeDirection.toUpperCase()}
                      </span>
                    </div>
                    <div className='text-xs flex justify-between mb-1'>
                      <span>Size:</span>
                      <span>
                        {updatedAccount.perps[0].amount
                          .abs()
                          .shiftedBy(-perpsAsset.decimals)
                          .toString()}{' '}
                        {perpsAsset.symbol}
                      </span>
                    </div>
                  </div>
                )}

                <div className='text-xs flex justify-between mb-1 pt-1 border-t border-white/10'>
                  <span>Account Health:</span>
                  <span>N/A (see Account Summary)</span>
                </div>

                <div className='text-xs flex justify-between'>
                  <span>Account Leverage:</span>
                  <span>{leverage ? leverage.toFixed(2) : 'N/A'}x</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
