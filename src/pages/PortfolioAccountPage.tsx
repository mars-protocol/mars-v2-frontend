import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import ShareBar from 'components/common/ShareBar'
import Balances from 'components/portfolio/Account/Balances'
import BreadCrumbs from 'components/portfolio/Account/BreadCrumbs'
import ManageAccount from 'components/portfolio/Account/ManageAccount'
import PerpPositions from 'components/portfolio/Account/PerpPositions'
import Strategies from 'components/portfolio/Account/Strategies'
import Summary from 'components/portfolio/Account/Summary'
import useAccount from 'hooks/accounts/useAccount'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import { getRoute } from 'utils/route'
import PerpsVaultSection from 'components/perps/VaultSection'

export default function PortfolioAccountPage() {
  const chainConfig = useChainConfig()
  const { urlAddress, accountId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const { data: accountIds } = useAccountIds(address)
  const isUsersAccount = accountId && accountIds ? accountIds.includes(accountId) : false
  const { data: account } = useAccount(accountId, true)

  if (!accountId || !account) {
    navigate(getRoute('portfolio', searchParams, urlAddress))
    return null
  }

  return (
    <div className='flex flex-wrap w-full gap-6'>
      <BreadCrumbs accountId={accountId} />
      <Summary account={account} />
      {isUsersAccount && <ManageAccount account={account} />}
      <Balances account={account} isUsersAccount={isUsersAccount} />
      {chainConfig.farm && <Strategies account={account} />}
      {chainConfig.perps && <PerpPositions account={account} />}
      {chainConfig.perps && <PerpsVaultSection accountId={accountId} />}
      <ShareBar text={`Have a look at Credit Account ${accountId} on @mars_protocol!`} />
    </div>
  )
}
