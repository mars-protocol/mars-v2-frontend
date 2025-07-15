import classNames from 'classnames'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetBalanceRow from 'components/common/assets/AssetBalanceRow'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  changes: HlsClosingChanges['swap']
  collateralAsset: Asset
  debtAsset: Asset
  isLoadingRoute?: boolean
}

export default function SwapInfo(props: Props) {
  const { changes, collateralAsset, debtAsset, isLoadingRoute = false } = props

  // Always render the component structure to prevent jumping
  return (
    <div className='flex flex-col w-full gap-2'>
      <Text className='mt-6' size='sm'>
        Swap
      </Text>
      <Text className='text-white/50' size='xs'>
        A part of the current position will be swapped to repay the borrowed funds
      </Text>

      <div className='flex items-center gap-2'>
        <AssetBalanceRow
          asset={collateralAsset}
          coin={
            !changes || isLoadingRoute
              ? BNCoin.fromDenomAndBigNumber(collateralAsset.denom, BN_ZERO)
              : changes.coinIn
          }
          className={classNames(
            'p-2 rounded-md bg-white/5',
            (!changes || isLoadingRoute) && 'animate-pulse',
          )}
          hideNames
          small
        />
        <ArrowRight className='w-10 h-10 text-white' />
        <AssetBalanceRow
          asset={debtAsset}
          coin={
            !changes || isLoadingRoute
              ? BNCoin.fromDenomAndBigNumber(debtAsset.denom, BN_ZERO)
              : changes.coinOut
          }
          className={classNames(
            'p-2 rounded-md bg-white/5',
            (!changes || isLoadingRoute) && 'animate-pulse',
          )}
          hideNames
          small
        />
      </div>
    </div>
  )
}
