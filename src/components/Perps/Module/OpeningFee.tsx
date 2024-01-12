import BigNumber from 'bignumber.js'

import { CircularProgress } from 'components/CircularProgress'
import DisplayCurrency from 'components/DisplayCurrency'
import useOpeningFee from 'hooks/perps/useOpeningFee'

type Props = {
  denom: string
  amount: BigNumber
}

export default function OpeningFee(props: Props) {
  const { data: openingFee, isLoading } = useOpeningFee(props.denom, props.amount)

  if (isLoading) return <CircularProgress />
  if (props.amount.isZero() || !openingFee) return '-'

  return <DisplayCurrency coin={openingFee} />
}
