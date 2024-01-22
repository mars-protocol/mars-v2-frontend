import { useCallback, useMemo } from 'react'

import Button from 'components/common/Button'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useAllAssets from 'hooks/assets/useAllAssets'
import useHealthComputer from 'hooks/useHealthComputer'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getHealthFactorMessage } from 'utils/messages'

interface Props {
  account: Account
  action: HlsStakingManageAction
  borrowAsset: Asset
  collateralAsset: Asset
}

export default function Withdraw(props: Props) {
  const { removedDeposits, removeDeposits, updatedAccount } = useUpdatedAccount(props.account)
  const { computeMaxWithdrawAmount } = useHealthComputer(updatedAccount)
  const assets = useAllAssets()
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
    if (!removedDeposit) return
    withdraw({
      accountId: props.account.id,
      coins: [{ coin: removedDeposit }],
      borrow: [],
      reclaims: [],
    })
  }, [props.account.id, removedDeposit, withdraw])

  const withdrawAmount = useMemo(() => removedDeposit?.amount || BN_ZERO, [removedDeposit?.amount])

  const warningMessages = useMemo(() => {
    if (maxWithdrawAmount.isLessThan(withdrawAmount) || maxWithdrawAmount.isZero()) {
      return [
        getHealthFactorMessage(props.collateralAsset.denom, maxWithdrawAmount, 'withdraw', assets),
      ]
    }
    return []
  }, [assets, maxWithdrawAmount, props.collateralAsset.denom, withdrawAmount])

  return (
    <>
      <TokenInputWithSlider
        amount={withdrawAmount}
        asset={props.collateralAsset}
        max={maxWithdrawAmount}
        onChange={handleChange}
        maxText='Available'
        warningMessages={warningMessages}
      />
      <Button
        onClick={onClick}
        text='Withdraw'
        disabled={withdrawAmount.isZero() || warningMessages.length !== 0}
      />
    </>
  )
}
