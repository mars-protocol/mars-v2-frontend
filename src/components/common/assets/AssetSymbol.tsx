import Text from 'components/common/Text'

interface Props {
  symbol: string
}
export default function AssetSymbol(props: Props) {
  return (
    <Text size='xs' tag='span' className='rounded-sm text-white/50 px-[6px] py-[2px] h-5'>
      {props.symbol}
    </Text>
  )
}
