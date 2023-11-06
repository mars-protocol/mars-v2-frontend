import React from 'react'

import Content from 'components/Modals/HLS/Deposit'

interface Props {
  account: Account
  action: HlsStakingManageAction
  borrowAsset: Asset
  collateralAsset: Asset
}

export default function Deposit(props: Props) {
  return (
    <Content
      borrowAsset={props.borrowAsset}
      collateralAsset={props.collateralAsset}
      vaultAddress=''
    />
  )
}
