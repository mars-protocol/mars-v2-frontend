import Container from 'components/Modals/HLS/Deposit/Summary/Container'
import AmountAndValue from 'components/common/AmountAndValue'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import AssetImage from 'components/common/assets/AssetImage'
import useMarket from 'hooks/markets/useMarket'

interface Props {
  amount: BigNumber
  asset: Asset | BorrowAsset
  isBorrow?: boolean
}
export default function AssetSummary(props: Props) {
  const market = useMarket(props.asset.denom)
  return (
    <Container title={props.isBorrow ? 'Leverage' : 'Supplying'}>
      <div className='flex justify-between'>
        <span className='flex items-center gap-2'>
          <AssetImage asset={props.asset} className='w-8 h-8' />
          <Text size='xs' className='font-bold'>
            {props.asset.symbol}
          </Text>
        </span>
        <AmountAndValue asset={props.asset} amount={props.amount} isApproximation />
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
