import { useNavigate, useParams } from 'react-router-dom'

import MigrationBanner from 'components/MigrationBanner'
import Balances from 'components/Portfolio/Account/Balances'
import BreadCrumbs from 'components/Portfolio/Account/BreadCrumbs'
import Summary from 'components/Portfolio/Account/Summary'
import ShareBar from 'components/ShareBar'
import useAccountId from 'hooks/useAccountId'
import { getRoute } from 'utils/route'

export default function PortfolioAccountPage() {
  const selectedAccountId = useAccountId()
  const { address, accountId } = useParams()
  const navigate = useNavigate()

  if (!accountId) {
    navigate(getRoute('portfolio', address, selectedAccountId))
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
