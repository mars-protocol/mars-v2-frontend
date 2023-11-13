import React, { useCallback, useMemo, useState } from 'react'

import Button from 'components/Button'
import LeverageSummary from 'components/Modals/HLS/Deposit/LeverageSummary'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useHealthComputer from 'hooks/useHealthComputer'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrices from 'hooks/usePrices'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { getAccountPositionValues } from 'utils/accounts'
import { getHlsStakingChangeLevActions } from 'utils/actions'
import { byDenom } from 'utils/array'
import { getLeveragedApy } from 'utils/math'

interface Props {
  account: HLSAccountWithStrategy
  action: HlsStakingManageAction
  borrowAsset: BorrowAsset
  collateralAsset: Asset
}

export default function ChangeLeverage(props: Props) {
  const { data: prices } = usePrices()
  const [slippage] = useLocalStorage<number>(LocalStorageKeys.SLIPPAGE, DEFAULT_SETTINGS.slippage)
  const { updatedAccount, simulateHlsStakingDeposit, simulateHlsStakingWithdraw, leverage } =
    useUpdatedAccount(props.account)

  const changeHlsStakingLeverage = useStore((s) => s.changeHlsStakingLeverage)
  const { computeMaxBorrowAmount } = useHealthComputer(props.account)
  const previousDebt: BigNumber = useMemo(
    () => props.account.debts.find(byDenom(props.borrowAsset.denom))?.amount || BN_ZERO,
    [props.account.debts, props.borrowAsset.denom],
  )

  const [currentDebt, setAmount] = useState(previousDebt)
  const maxBorrowAmount = useMemo(() => {
    return computeMaxBorrowAmount(props.borrowAsset.denom, 'deposit').plus(previousDebt)
  }, [computeMaxBorrowAmount, previousDebt, props.borrowAsset.denom])

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
    )

    return deposits.plus(lends).plus(debts).plus(vaults)
  }, [prices, props.account, updatedAccount])

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
    )
    changeHlsStakingLeverage({ accountId: props.account.id, actions })
  }, [
    currentDebt,
    changeHlsStakingLeverage,
    previousDebt,
    prices,
    props.account.id,
    props.borrowAsset.denom,
    props.collateralAsset.denom,
    slippage,
  ])

  const apy = useMemo(() => {
    if (!props.borrowAsset.borrowRate || !props.account.strategy.apy) return 0
    return getLeveragedApy(props.account.strategy.apy, props.borrowAsset.borrowRate, leverage)
  }, [leverage, props.account.strategy.apy, props.borrowAsset.borrowRate])

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
      />
      <div className='flex flex-col gap-6'>
        <LeverageSummary asset={props.borrowAsset} positionValue={positionValue} apy={apy} />
        <Button onClick={handleOnClick} text='Confirm' />
      </div>
    </>
  )
}
