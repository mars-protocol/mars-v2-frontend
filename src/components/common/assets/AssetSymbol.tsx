import Text from 'Text'

interface Props {
  symbol: string
}
export default function AssetSymbol(props: Props) {
  return (
    <Text
      size='xs'
      tag='span'
      className='rounded-sm bg-white/10 text-white/50 px-[6px] py-[2px] h-5'
    >
      {props.symbol}
    </Text>
  )
}
