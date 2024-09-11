import AssetSummary from 'components/Modals/Hls/Deposit/Summary/AssetSummary'
import YourPosition from 'components/Modals/Hls/Deposit/Summary/YourPosition'
import useRouteInfo from 'hooks/trade/useRouteInfo'
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
  const { data: route } = useRouteInfo(
    props.borrowMarket.asset.denom,
    props.collateralAsset.denom,
    props.borrowAmount,
  )

  return (
    <div id='item-3' className='flex flex-col gap-4 p-4'>
      <AssetSummary
        asset={props.collateralAsset}
        amount={props.depositAmount}
        borrowAsset={props.borrowMarket.asset}
      />
      <AssetSummary
        asset={props.collateralAsset}
        amount={props.borrowAmount}
        borrowAsset={props.borrowMarket.asset}
        swapOutputAmount={route?.amountOut}
        isBorrow
      />

      <YourPosition
        positionValue={BNCoin.fromDenomAndBigNumber('usd', props.positionValue)}
        baseApy={props.apy || 0}
        borrowRate={props.borrowMarket.apy.borrow || 0}
        leverage={props.leverage}
        route={route}
        assets={{ in: props.collateralAsset, out: props.borrowMarket.asset }}
        onClickBtn={props.onClickBtn}
        disabled={props.disabled}
      />
    </div>
  )
}
