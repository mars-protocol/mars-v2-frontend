import Divider from 'components/common/Divider'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import { formatPercent } from 'utils/formatters'

export function SubHeader() {
  const { data: perpsVault } = usePerpsVault()

  if (!perpsVault) return null

  return (
    <div className='flex gap-6 items-stretch px-6 py-4'>
      <TitleAndSubCell title={'something'} sub='TVL' />
      <Divider orientation='vertical' />
      <TitleAndSubCell title={formatPercent(110)} sub='Collateralization Ratio' />
      <Divider orientation='vertical' />
      <TitleAndSubCell title='-' sub='Deposit APY' />
    </div>
  )
}
