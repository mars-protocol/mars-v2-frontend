import { ORACLE_DENOM } from '../../../../../../constants/oracle'
import { BNCoin } from '../../../../../../types/classes/BNCoin'
import DisplayCurrency from '../../../../../common/DisplayCurrency'

export const POSITION_VALUE_META = {
  header: 'Pos. Value',
}

interface Props {
  vault: DepositedAstroLp
}
export default function AstroLpPositionValue(props: Props) {
  const { vault } = props
  const positionValue = vault.values.primary.plus(vault.values.secondary)
  const coin = BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, positionValue)
  return <DisplayCurrency coin={coin} className='text-xs' />
}
