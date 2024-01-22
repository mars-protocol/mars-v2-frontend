import Text from 'components/common/Text'
export const ASSET_META = { accessorKey: 'symbol', header: 'Asset', id: 'symbol' }

interface Props {
  symbol: string
  type: AccountType
}

export default function Asset(props: Props) {
  const { symbol, type } = props
  return (
    <Text size='xs'>
      {symbol}
      {type === 'borrowing' && <span className='ml-1 text-loss'>(debt)</span>}
      {type === 'lending' && <span className='ml-1 text-profit'>(lent)</span>}
      {type === 'vault' && <span className='ml-1 text-profit'>(farm)</span>}
    </Text>
  )
}
