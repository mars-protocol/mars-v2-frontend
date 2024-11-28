import DisplayCurrency from 'components/common/DisplayCurrency'
import { ORACLE_DENOM } from 'constants/oracle'
import { BNCoin } from 'types/classes/BNCoin'

export default function Value({ row }: { row: PerpsVaultRow }) {
  return (
    <DisplayCurrency
      coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, row.values.primary)}
      className='text-xs'
    />
  )
}
