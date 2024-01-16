import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import MigrationBanner from 'components/common/MigrationBanner'
import Balances from 'components/portfolio/Account/Balances'
import BreadCrumbs from 'components/portfolio/Account/BreadCrumbs'
import Summary from 'components/portfolio/Account/Summary'
import ShareBar from 'components/common/ShareBar'
import useAccountId from 'hooks/useAccountId'
import { getRoute } from 'utils/route'

export default function PortfolioAccountPage() {
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
      <ShareBar text={`Have a look at Credit Account ${accountId} on @mars_protocol!`} />
    </div>
  )
}
