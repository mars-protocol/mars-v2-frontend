import DisplayCurrency from 'components/DisplayCurrency'
import usePrice from 'hooks/usePrice'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export const PRICE_META = { id: 'price', header: 'Price' }

interface Props {
  amount: number
  denom: string
  type: 'deposits' | 'borrowing' | 'lending' | 'vault'
}

export default function Price(props: Props) {
  const price = usePrice(props.denom)

  if (props.amount === 0 || props.type === 'vault') return null

  return (
    <DisplayCurrency
      className='text-xs text-right number'
      coin={BNCoin.fromDenomAndBigNumber('usd', BN(price))}
    />
  )
}
