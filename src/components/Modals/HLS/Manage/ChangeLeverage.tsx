import React, { useCallback, useMemo, useState } from 'react'

import Button from 'components/Button'
import LeverageSummary from 'components/Modals/HLS/Deposit/LeverageSummary'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useAllAssets from 'hooks/assets/useAllAssets'
import useHealthComputer from 'hooks/useHealthComputer'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrices from 'hooks/usePrices'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
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
  borrowAsset: BorrowAsset
  collateralAsset: Asset
}

export default function ChangeLeverage(props: Props) {
  const { data: prices } = usePrices()
  const assets = useAllAssets()
  const [slippage] = useLocalStorage<number>(LocalStorageKeys.SLIPPAGE, DEFAULT_SETTINGS.slippage)
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
    () => props.account.debts.find(byDenom(props.borrowAsset.denom))?.amount || BN_ZERO,
    [props.account.debts, props.borrowAsset.denom],
  )

  const [currentDebt, setAmount] = useState(previousDebt)
  const maxBorrowAmount = useMemo(() => {
    return computeMaxBorrowAmount(props.borrowAsset.denom, {
      swap: {
        denom_out: props.collateralAsset.denom,
        slippage: SWAP_FEE_BUFFER.toString(),
      },
    }).plus(previousDebt)
  }, [computeMaxBorrowAmount, previousDebt, props.borrowAsset.denom, props.collateralAsset.denom])

  const onChangeAmount = useCallback(
    (currentDebt: BigNumber) => {
      setAmount(currentDebt)
      if (currentDebt.isLessThan(previousDebt)) {
        simulateHlsStakingWithdraw(
          props.collateralAsset.denom,
          props.borrowAsset.denom,
          previousDebt.minus(currentDebt),
        )
      } else {
        simulateHlsStakingDeposit(
          BNCoin.fromDenomAndBigNumber(props.collateralAsset.denom, BN_ZERO),
          BNCoin.fromDenomAndBigNumber(props.borrowAsset.denom, currentDebt.minus(previousDebt)),
        )
      }
    },
    [
      previousDebt,
      props.borrowAsset.denom,
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
      props.borrowAsset.denom,
      slippage,
      prices,
      assets,
    )
    changeHlsStakingLeverage({ accountId: props.account.id, actions })
  }, [
    currentDebt,
    previousDebt,
    props.collateralAsset.denom,
    props.borrowAsset.denom,
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
    if (!props.borrowAsset.borrowRate || !props.account.strategy.apy) return 0
    return getLeveragedApy(props.account.strategy.apy, props.borrowAsset.borrowRate, leverage)
  }, [leverage, props.account.strategy.apy, props.borrowAsset.borrowRate])

  const warningMessages = useMemo(() => {
    const messages: string[] = []

    const borrowLiquidity = props.borrowAsset.liquidity?.amount || BN_ZERO

    if (borrowLiquidity.isLessThan(currentDebt.minus(previousDebt))) {
      messages.push(getLiquidityMessage(props.borrowAsset.denom, borrowLiquidity, assets))
    }

    if (maxBorrowAmount.isLessThan(currentDebt)) {
      messages.push(
        getHealthFactorMessage(props.borrowAsset.denom, maxBorrowAmount, 'borrow', assets),
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
    props.borrowAsset.denom,
    props.borrowAsset.liquidity?.amount,
    props.collateralAsset.denom,
  ])

  return (
    <>
      <TokenInputWithSlider
        amount={currentDebt}
        asset={props.borrowAsset}
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
        <LeverageSummary asset={props.borrowAsset} positionValue={positionValue} apy={apy} />
        <Button
          onClick={handleOnClick}
          text='Confirm'
          disabled={currentDebt.isEqualTo(previousDebt) || warningMessages.length !== 0}
        />
      </div>
    </>
  )
}
