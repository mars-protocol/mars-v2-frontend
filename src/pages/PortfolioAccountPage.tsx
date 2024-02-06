import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import MigrationBanner from 'components/common/MigrationBanner'
import ShareBar from 'components/common/ShareBar'
import Balances from 'components/portfolio/Account/Balances'
import BreadCrumbs from 'components/portfolio/Account/BreadCrumbs'
import PerpPositions from 'components/portfolio/Account/PerpPositions'
import Strategies from 'components/portfolio/Account/Strategies'
import Summary from 'components/portfolio/Account/Summary'
import useAccountId from 'hooks/useAccountId'
import useChainConfig from 'hooks/useChainConfig'
import { getRoute } from 'utils/route'

export default function PortfolioAccountPage() {
  const chainConfig = useChainConfig()
  const selectedAccountId = useAccountId()
  const { address, accountId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  if (!accountId) {
    navigate(getRoute('portfolio', searchParams, address, selectedAccountId))
    return null
  }

  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      <BreadCrumbs accountId={accountId} />
      <Summary accountId={accountId} />
      <Balances accountId={accountId} />
      {chainConfig.farm && <Strategies accountId={accountId} />}
      {chainConfig.perps && <PerpPositions accountId={accountId} />}
      <ShareBar text={`Have a look at Credit Account ${accountId} on @mars_protocol!`} />
    </div>
  )
}
