import classNames from 'classnames'
import AmountAndValue from 'components/common/AmountAndValue'
import AssetImage from 'components/common/assets/AssetImage'
import Container from 'components/common/Container'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import { BN_ZERO } from 'constants/math'
import useAssets from 'hooks/assets/useAssets'
import useMarket from 'hooks/markets/useMarket'
import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { getCoinValue } from 'utils/formatters'

interface Props {
  amount: BigNumber
  asset: Asset
  borrowAsset: Asset
  swapOutputAmount?: BigNumber
  isBorrow?: boolean
  isFarm?: boolean
}
export default function AssetSummary(props: Props) {
  const market = useMarket(props.borrowAsset.denom)
  const asset = props.isBorrow ? props.borrowAsset : props.asset
  const { data: assets } = useAssets()

  const changePercentage = useMemo(() => {
    if (!props.swapOutputAmount) return BN_ZERO

    const valueIn = getCoinValue(
      BNCoin.fromDenomAndBigNumber(props.borrowAsset.denom, props.amount),
      assets,
    )
    const valueOut = getCoinValue(
      BNCoin.fromDenomAndBigNumber(props.asset.denom, props.swapOutputAmount),
      assets,
    )

    return valueOut.minus(valueIn).div(valueIn).times(100)
  }, [props.swapOutputAmount, props.asset.denom, props.amount, props.borrowAsset.denom, assets])

  if (props.amount.isZero()) return null
  const stakingTitle = props.isBorrow ? 'Borrow + Swap' : 'Supplying'
  const farmingTitle = props.isBorrow ? 'Borrow' : 'Supplying'
  return (
    <Container title={props.isFarm ? farmingTitle : stakingTitle}>
      <div className={classNames(props.isBorrow && 'flex')}>
        <div className='flex justify-between flex-1'>
          <span className='flex items-center gap-2'>
            <AssetImage asset={asset} className='w-8 h-8' />
            <Text size='xs' className='font-bold'>
              {asset.symbol}
            </Text>
          </span>
          <AmountAndValue asset={asset} amount={props.amount} isApproximation />
        </div>

        {props.isBorrow && !props.isFarm && (
          <>
            <div className='flex items-center w-5 mx-5'>
              <ArrowRight />
            </div>
            <div className='flex justify-between flex-1'>
              <span className='flex items-center gap-2'>
                <AssetImage asset={props.asset} className='w-8 h-8' />
                <Text size='xs' className='font-bold'>
                  {props.asset.symbol}
                </Text>
              </span>
              <AmountAndValue
                asset={props.asset}
                amount={props.swapOutputAmount || BN_ZERO}
                changePercentage={changePercentage}
                isApproximation
              />
            </div>
          </>
        )}
      </div>

      {props.isBorrow && (
        <div className='grid py-2 mt-3 rounded-sm bg-white/5 place-items-center'>
          <FormattedNumber
            amount={market?.apy.borrow || 0}
            options={{ suffix: '% Borrow Rate', maxDecimals: 2, minDecimals: 0 }}
            className='text-xs text-white/70'
          />
        </div>
      )}
    </Container>
  )
}
