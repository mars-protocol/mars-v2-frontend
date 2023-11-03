import React from 'react'

import Button from 'components/Button'
import { ArrowRight } from 'components/Icons'
import AssetSummary from 'components/Modals/HLS/Summary/AssetSummary'
import YourPosition from 'components/Modals/HLS/Summary/YourPosition'
import useBorrowAsset from 'hooks/useBorrowAsset'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  apy: number
  borrowAmount: BigNumber
  borrowAsset: Asset
  collateralAsset: Asset
  depositAmount: BigNumber
  leverage: number
  onClickBtn: () => void
  positionValue: BigNumber
}

export default function Summary(props: Props) {
  const borrowAsset = useBorrowAsset(props.borrowAsset.denom)

  if (!borrowAsset) return null

  return (
    <div className='p-4 flex flex-col gap-4'>
      <AssetSummary asset={props.collateralAsset} amount={props.depositAmount} />
      <AssetSummary asset={borrowAsset} amount={props.borrowAmount} isBorrow />
      <YourPosition
        positionValue={BNCoin.fromDenomAndBigNumber('usd', props.positionValue)}
        baseApy={props.apy || 0}
        borrowRate={borrowAsset.borrowRate || 0}
        leverage={props.leverage}
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
