import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import AssetImage from 'components/common/assets/AssetImage'
import { BNCoin } from 'types/classes/BNCoin'
import { demagnify } from 'utils/formatters'

interface Props {
  asset: Asset
  coin: BNCoin
}

export default function AssetBalanceRow(props: Props) {
  return (
    <div className='flex items-center w-full gap-4'>
      <AssetImage asset={props.asset} className='w-8 h-8' />
      <div className='flex flex-wrap flex-1'>
        <Text className='w-full'>{props.asset.symbol}</Text>
        <Text size='sm' className='w-full text-white/50'>
          {props.asset.name}
        </Text>
      </div>
      <div className='flex flex-wrap'>
        <DisplayCurrency coin={props.coin} className='w-full text-right' />
        <FormattedNumber
          amount={demagnify(props.coin.amount, props.asset)}
          className='w-full text-sm text-right text-white/50'
          options={{ suffix: ` ${props.asset.symbol}`, maxDecimals: props.asset.decimals }}
          animate
        />
      </div>
    </div>
  )
}
