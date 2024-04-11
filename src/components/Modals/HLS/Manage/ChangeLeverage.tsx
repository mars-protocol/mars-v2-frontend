import React, { useCallback, useMemo, useState } from 'react'

import Button from 'components/common/Button'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import LeverageSummary from 'components/Modals/HLS/Deposit/LeverageSummary'
import { BN_ZERO } from 'constants/math'
import useAllAssets from 'hooks/assets/useAllAssets'
import usePrices from 'hooks/prices/usePrices'
import useSlippage from 'hooks/settings/useSlippage'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { getAccountPositionValues } from 'utils/accounts'
import { getHlsStakingChangeLevActions } from 'utils/actions'
import { byDenom } from 'utils/array'
import { SWAP_FEE_BUFFER } from 'utils/constants'
import { getLeveragedApy } from 'utils/math'
import { getDepositCapMessage, getHealthFactorMessage, getLiquidityMessage } from 'utils/messages'

interface Props {
  account: HLSAccountWithStrategy
  action: HlsStakingManageAction
  borrowMarket: Market
  collateralAsset: Asset
}

export default function ChangeLeverage(props: Props) {
  const { data: prices } = usePrices()
  const assets = useAllAssets()
  const [slippage] = useSlippage()
  const {
    updatedAccount,
    simulateHlsStakingDeposit,
    simulateHlsStakingWithdraw,
    leverage,
    addedTrades,
  } = useUpdatedAccount(props.account)

  const changeHlsStakingLeverage = useStore((s) => s.changeHlsStakingLeverage)
  const { computeMaxBorrowAmount } = useHealthComputer(props.account)
  const previousDebt: BigNumber = useMemo(
    () => props.account.debts.find(byDenom(props.borrowMarket.asset.denom))?.amount || BN_ZERO,
    [props.account.debts, props.borrowMarket.asset.denom],
  )

  const [currentDebt, setAmount] = useState(previousDebt)
  const maxBorrowAmount = useMemo(() => {
    return computeMaxBorrowAmount(props.borrowMarket.asset.denom, {
      swap: {
        denom_out: props.collateralAsset.denom,
        slippage: SWAP_FEE_BUFFER.toString(),
      },
    }).plus(previousDebt)
  }, [
    computeMaxBorrowAmount,
    previousDebt,
    props.borrowMarket.asset.denom,
    props.collateralAsset.denom,
  ])

  const onChangeAmount = useCallback(
    (currentDebt: BigNumber) => {
      setAmount(currentDebt)
      if (currentDebt.isLessThan(previousDebt)) {
        simulateHlsStakingWithdraw(
          props.collateralAsset.denom,
          props.borrowMarket.asset.denom,
          previousDebt.minus(currentDebt),
        )
      } else {
        simulateHlsStakingDeposit(
          BNCoin.fromDenomAndBigNumber(props.collateralAsset.denom, BN_ZERO),
          BNCoin.fromDenomAndBigNumber(
            props.borrowMarket.asset.denom,
            currentDebt.minus(previousDebt),
          ),
        )
      }
    },
    [
      previousDebt,
      props.borrowMarket.asset.denom,
      props.collateralAsset.denom,
      simulateHlsStakingDeposit,
      simulateHlsStakingWithdraw,
    ],
  )

  const positionValue = useMemo(() => {
    const [deposits, lends, debts, vaults] = getAccountPositionValues(
      updatedAccount || props.account,
      prices,
      assets,
    )

    return deposits.plus(lends).plus(debts).plus(vaults)
  }, [assets, prices, props.account, updatedAccount])

  const handleOnClick = useCallback(() => {
    useStore.setState({ hlsManageModal: null })
    if (currentDebt.isEqualTo(previousDebt)) return
    const actions = getHlsStakingChangeLevActions(
      previousDebt,
      currentDebt,
      props.collateralAsset.denom,
      props.borrowMarket.asset.denom,
      slippage,
      prices,
      assets,
    )
    changeHlsStakingLeverage({ accountId: props.account.id, actions })
  }, [
    currentDebt,
    previousDebt,
    props.collateralAsset.denom,
    props.borrowMarket.asset.denom,
    props.account.id,
    slippage,
    prices,
    assets,
    changeHlsStakingLeverage,
  ])

  const addedDepositAmount = useMemo(
    () => addedTrades.find(byDenom(props.collateralAsset.denom))?.amount || BN_ZERO,
    [addedTrades, props.collateralAsset.denom],
  )

  const depositCapLeft = useMemo(
    () => props.account.strategy.depositCap.max.minus(props.account.strategy.depositCap.used),
    [props.account.strategy.depositCap.max, props.account.strategy.depositCap.used],
  )

  const apy = useMemo(() => {
    if (!props.borrowMarket.apy.borrow || !props.account.strategy.apy) return 0
    return getLeveragedApy(props.account.strategy.apy, props.borrowMarket.apy.borrow, leverage)
  }, [leverage, props.account.strategy.apy, props.borrowMarket.apy.borrow])

  const warningMessages = useMemo(() => {
    const messages: string[] = []

    const borrowLiquidity = props.borrowMarket.liquidity || BN_ZERO

    if (borrowLiquidity.isLessThan(currentDebt.minus(previousDebt))) {
      messages.push(getLiquidityMessage(props.borrowMarket.asset.denom, borrowLiquidity, assets))
    }

    if (maxBorrowAmount.isLessThan(currentDebt)) {
      messages.push(
        getHealthFactorMessage(props.borrowMarket.asset.denom, maxBorrowAmount, 'borrow', assets),
      )
    }

    if (addedDepositAmount.isGreaterThan(depositCapLeft)) {
      messages.push(
        getDepositCapMessage(props.collateralAsset.denom, depositCapLeft, 'borrow', assets),
      )
    }

    return messages
  }, [
    addedDepositAmount,
    assets,
    currentDebt,
    depositCapLeft,
    maxBorrowAmount,
    previousDebt,
    props.borrowMarket.asset.denom,
    props.borrowMarket.liquidity,
    props.collateralAsset.denom,
  ])

  return (
    <>
      <TokenInputWithSlider
        amount={currentDebt}
        asset={props.borrowMarket.asset}
        max={maxBorrowAmount}
        onChange={onChangeAmount}
        maxText='Max borrow'
        leverage={{
          current: leverage,
          max: props.account.strategy.maxLeverage,
        }}
        warningMessages={warningMessages}
      />
      <div className='flex flex-col gap-6'>
        <LeverageSummary asset={props.borrowMarket.asset} positionValue={positionValue} apy={apy} />
        <Button
          onClick={handleOnClick}
          text='Confirm'
          disabled={currentDebt.isEqualTo(previousDebt) || warningMessages.length !== 0}
        />
      </div>
    </>
  )
}
