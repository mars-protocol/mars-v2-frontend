import DisplayCurrency from 'components/common/DisplayCurrency'

export const PNL_META = { id: 'pnl', header: 'Total PnL', meta: { className: 'w-30' } }

interface Props {
  pnl: PerpsPnL
}

export default function TotalPnL(props: Props) {
  const { pnl } = props

  return (
    <DisplayCurrency
      className='text-xs text-right number'
      coin={pnl.net}
      options={{ abbreviated: false }}
      isProfitOrLoss
      showZero
    />
  )
}
