import React from 'react'

import Button from 'components/Button'
import { ArrowRight } from 'components/Icons'
import AssetSummary from 'components/Modals/HLS/Summary/AssetSummary'
import YourPosition from 'components/Modals/HLS/Summary/YourPosition'
import useBorrowAsset from 'hooks/useBorrowAsset'
import { BNCoin } from 'types/classes/BNCoin'
import { getAssetByDenom } from 'utils/assets'

interface Props {
  borrowAmount: BigNumber
  depositAmount: BigNumber
  onClickBtn: () => void
  positionValue: BigNumber
  vault: Vault
}

export default function Summary(props: Props) {
  const collateralAsset = getAssetByDenom(props.vault.denoms.primary)
  const borrowAsset = useBorrowAsset(props.vault.denoms.secondary)

  if (!collateralAsset || !borrowAsset) return null

  return (
    <div className='p-4 flex flex-col gap-4'>
      <AssetSummary asset={collateralAsset} amount={props.depositAmount} />
      <AssetSummary asset={borrowAsset} amount={props.borrowAmount} isBorrow />
      <YourPosition
        positionValue={BNCoin.fromDenomAndBigNumber('usd', props.positionValue)}
        baseApy={props.vault.apy || 0}
        borrowRate={borrowAsset.borrowRate || 0}
        leverage={3.5}
      />
      <Button
        onClick={props.onClickBtn}
        text='Approve Funding Transaction'
        rightIcon={<ArrowRight />}
        className='mt-1'
      />
    </div>
  )
}
