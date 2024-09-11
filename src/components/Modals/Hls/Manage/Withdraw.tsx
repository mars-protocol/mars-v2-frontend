import { useCallback, useMemo, useState } from 'react'

import Button from 'components/common/Button'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { getHealthFactorMessage } from 'utils/messages'

interface Props {
  account: Account
  collateralAsset: Asset
}

export default function Withdraw(props: Props) {
  const { collateralAsset, account } = props
  const { simulateWithdraw, updatedAccount } = useUpdatedAccount(account)
  const { computeMaxWithdrawAmount } = useHealthComputer(updatedAccount)
  const assets = useDepositEnabledAssets()
  const [amount, setAmount] = useState(BN_ZERO)
  const withdraw = useStore((s) => s.withdraw)
  const extraWithdrawAmount = computeMaxWithdrawAmount(collateralAsset.denom)
  const handleChange = useCallback(
    (newAmount: BigNumber) => {
      setAmount(newAmount)
      simulateWithdraw(false, BNCoin.fromDenomAndBigNumber(collateralAsset.denom, newAmount))
    },
    [collateralAsset.denom, simulateWithdraw],
  )

  const maxWithdrawAmount = useMemo(
    () => extraWithdrawAmount.plus(amount),
    [amount, extraWithdrawAmount],
  )

  const onClick = useCallback(() => {
    useStore.setState({ hlsManageModal: null })
    withdraw({
      accountId: account.id,
      coins: [{ coin: BNCoin.fromDenomAndBigNumber(props.collateralAsset.denom, amount) }],
      borrow: [],
      reclaims: [],
    })
  }, [account.id, amount, props.collateralAsset.denom, withdraw])

  const warningMessages = useMemo(() => {
    if (maxWithdrawAmount.isLessThan(amount) || maxWithdrawAmount.isZero()) {
      return [
        getHealthFactorMessage(props.collateralAsset.denom, maxWithdrawAmount, 'withdraw', assets),
      ]
    }
    return []
  }, [assets, maxWithdrawAmount, props.collateralAsset.denom, amount])

  return (
    <>
      <TokenInputWithSlider
        amount={amount}
        asset={props.collateralAsset}
        max={maxWithdrawAmount}
        onChange={handleChange}
        maxText='Available'
        warningMessages={warningMessages}
      />
      <Button
        onClick={onClick}
        text='Withdraw'
        disabled={amount.isZero() || warningMessages.length !== 0}
      />
    </>
  )
}
