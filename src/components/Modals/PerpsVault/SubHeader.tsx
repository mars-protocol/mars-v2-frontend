import { PRICE_ORACLE_DECIMALS } from '../../../constants/query'
import usePerpsVault from '../../../hooks/perps/usePerpsVault'
import { formatPercent } from '../../../utils/formatters'
import Divider from '../../common/Divider'
import { FormattedNumber } from '../../common/FormattedNumber'
import TitleAndSubCell from '../../common/TitleAndSubCell'

export function SubHeader() {
  const { data: perpsVault } = usePerpsVault()

  if (!perpsVault) return null

  return (
    <div className='flex gap-6 items-stretch px-6 py-4'>
      <TitleAndSubCell
        title={
          <FormattedNumber
            amount={perpsVault.liquidity.toNumber()}
            options={{ abbreviated: true, decimals: PRICE_ORACLE_DECIMALS, prefix: '$' }}
          />
        }
        sub='TVL'
      />
      <Divider orientation='vertical' />
      <TitleAndSubCell title={formatPercent(110)} sub='Collateralization Ratio' />
      <Divider orientation='vertical' />
      <TitleAndSubCell title='-' sub='Deposit APY' />
    </div>
  )
}
