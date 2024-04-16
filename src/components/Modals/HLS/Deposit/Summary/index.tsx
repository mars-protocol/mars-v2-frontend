import AssetSummary from 'components/Modals/HLS/Deposit/Summary/AssetSummary'
import YourPosition from 'components/Modals/HLS/Deposit/Summary/YourPosition'
import Button from 'components/common/Button'
import { ArrowRight } from 'components/common/Icons'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  apy: number
  borrowAmount: BigNumber
  borrowMarket: Market
  collateralAsset: Asset
  depositAmount: BigNumber
  leverage: number
  onClickBtn: () => void
  positionValue: BigNumber
  disabled: boolean
}

export default function Summary(props: Props) {
  return (
    <div id='item-3' className='p-4 flex flex-col gap-4'>
      <AssetSummary asset={props.collateralAsset} amount={props.depositAmount} />
      <AssetSummary asset={props.borrowMarket.asset} amount={props.borrowAmount} isBorrow />
      <YourPosition
        positionValue={BNCoin.fromDenomAndBigNumber('usd', props.positionValue)}
        baseApy={props.apy || 0}
        borrowRate={props.borrowMarket.apy.borrow || 0}
        leverage={props.leverage}
      />
      <Button
        onClick={props.onClickBtn}
        text='Approve Funding Transaction'
        rightIcon={<ArrowRight />}
        className='mt-1'
        disabled={props.disabled}
      />
    </div>
  )
}
