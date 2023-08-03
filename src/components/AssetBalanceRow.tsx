import AssetImage from 'components/AssetImage'
import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import Text from 'components/Text'
import { BNCoin } from 'types/classes/BNCoin'
import { demagnify } from 'utils/formatters'

interface Props {
  asset: Asset
  coin: BNCoin
}

export default function AssetBalanceRow(props: Props) {
  return (
    <div className='flex w-full items-center gap-4'>
      <AssetImage asset={props.asset} size={32} />
      <div className='flex flex-1 flex-wrap'>
        <Text className='w-full'>{props.asset.symbol}</Text>
        <Text size='sm' className='w-full text-white/50'>
          {props.asset.name}
        </Text>
      </div>
      <div className='flex flex-wrap'>
        <DisplayCurrency coin={props.coin} className='w-full text-right' />
        <FormattedNumber
          amount={demagnify(props.coin.amount, props.asset)}
          className='w-full text-right text-sm text-white/50'
          options={{ suffix: ` ${props.asset.symbol}` }}
          animate
        />
      </div>
    </div>
  )
}
