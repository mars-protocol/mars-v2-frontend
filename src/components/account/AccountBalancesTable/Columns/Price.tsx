import DisplayCurrency from 'components/common/DisplayCurrency'
import usePrice from 'hooks/usePrice'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export const PRICE_META = { id: 'price', header: 'Price', meta: { className: 'w-30' } }

interface Props {
  amount: number
  denom: string
  type: AccountType
}

export default function Price(props: Props) {
  const price = usePrice(props.denom)

  if (props.amount === 0 || props.type === 'vault') return null

  return (
    <DisplayCurrency
      className='text-xs text-right number'
      coin={BNCoin.fromDenomAndBigNumber('usd', BN(price))}
      options={{ abbreviated: false }}
    />
  )
}
