import classNames from 'classnames'
import Text from 'components/common/Text'
import AssetBalanceRow from 'components/common/assets/AssetBalanceRow'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  repayCoin: BNCoin | null
  debtAsset: Asset
  isLoadingRoute?: boolean
}

export default function RepayInfo(props: Props) {
  const { repayCoin, debtAsset, isLoadingRoute = false } = props

  // Always render the component structure to prevent jumping
  return (
    <div className='flex flex-col w-full gap-2'>
      <Text className='mt-6' size='sm'>
        Repay
      </Text>
      <Text className='text-white/50' size='xs'>
        To bring the leverage down to 1x, the borrowed funds will be repaid
      </Text>

      <AssetBalanceRow
        asset={debtAsset}
        coin={
          !repayCoin || isLoadingRoute
            ? BNCoin.fromDenomAndBigNumber(debtAsset.denom, BN_ZERO)
            : repayCoin
        }
        className={classNames(
          'p-2 rounded-md bg-white/5',
          (!repayCoin || isLoadingRoute) && 'animate-pulse',
        )}
        hideNames
        small
      />
    </div>
  )
}
