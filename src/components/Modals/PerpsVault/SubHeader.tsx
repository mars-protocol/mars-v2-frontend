import Divider from 'components/common/Divider'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import { formatPercent } from 'utils/formatters'

export function SubHeader() {
  const { data: perpsVault } = usePerpsVault()

  if (!perpsVault) return null

  return (
    <div className='flex items-stretch gap-6 px-6 py-4'>
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
      <TitleAndSubCell
        title={formatPercent(perpsVault.collateralizationRatio * 100)}
        sub='Collateralization Ratio'
      />
      <Divider orientation='vertical' />
      <TitleAndSubCell title={formatPercent(perpsVault?.apy ?? 0)} sub='Deposit APY' />
    </div>
  )
}
