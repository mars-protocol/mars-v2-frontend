import DisplayCurrency from 'components/common/DisplayCurrency'
import { BNCoin } from 'types/classes/BNCoin'

export const PNL_META = { id: 'pnl', header: 'Total PnL', meta: { className: 'w-30' } }

interface Props {
  pnl: BNCoin
}

export default function TotalPnL(props: Props) {
  const { pnl } = props

  return (
    <DisplayCurrency
      className='text-xs text-right number'
      coin={pnl}
      options={{ abbreviated: false }}
      isProfitOrLoss
      showZero
    />
  )
}
