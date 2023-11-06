import React from 'react'

import Button from 'components/Button'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'

interface Props {
  account: Account
  action: HlsStakingManageAction
  borrowAsset: Asset
  collateralAsset: Asset
}

export default function Withdraw(props: Props) {
  const {} = useUpdatedAccount(props.account)

  return (
    <>
      <TokenInputWithSlider
        amount={BN_ZERO}
        asset={props.borrowAsset}
        max={BN_ZERO}
        onChange={() => {}}
        maxText='In Wallet'
      />
      <Button onClick={() => {}} text='Withdraw' />
    </>
  )
}
