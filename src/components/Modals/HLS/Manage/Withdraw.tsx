import React, { useCallback, useMemo } from 'react'

import Button from 'components/Button'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useHealthComputer from 'hooks/useHealthComputer'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

interface Props {
  account: Account
  action: HlsStakingManageAction
  borrowAsset: Asset
  collateralAsset: Asset
}

export default function Withdraw(props: Props) {
  const { removedDeposits, removeDeposits, updatedAccount } = useUpdatedAccount(props.account)
  const { computeMaxWithdrawAmount } = useHealthComputer(updatedAccount)
  const withdraw = useStore((s) => s.withdraw)
  const handleChange = useCallback(
    (amount: BigNumber) =>
      removeDeposits([BNCoin.fromDenomAndBigNumber(props.collateralAsset.denom, amount)]),
    [removeDeposits, props.collateralAsset.denom],
  )

  const removedDeposit = useMemo(
    () => removedDeposits.find(byDenom(props.collateralAsset.denom)),
    [props.collateralAsset.denom, removedDeposits],
  )

  const maxWithdrawAmount = useMemo(() => {
    const currentWithdrawAmount = removedDeposit?.amount || BN_ZERO
    const extraWithdrawAmount = computeMaxWithdrawAmount(props.collateralAsset.denom)
    return currentWithdrawAmount.plus(extraWithdrawAmount)
  }, [computeMaxWithdrawAmount, props.collateralAsset.denom, removedDeposit?.amount])

  const onClick = useCallback(() => {
    useStore.setState({ hlsManageModal: null })
    withdraw({
      accountId: props.account.id,
      coins: [{ coin: removedDeposit }],
      borrow: [],
      reclaims: [],
    })
  }, [props.account.id, removedDeposit, withdraw])

  return (
    <>
      <TokenInputWithSlider
        amount={removedDeposit?.amount || BN_ZERO}
        asset={props.collateralAsset}
        max={maxWithdrawAmount}
        onChange={handleChange}
        maxText='Available'
      />
      <Button onClick={onClick} text='Withdraw' disabled={removedDeposit?.amount?.isZero()} />
    </>
  )
}
