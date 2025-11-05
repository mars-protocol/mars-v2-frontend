import { useNavigate, useSearchParams } from 'react-router-dom'

import ShareBar from 'components/common/ShareBar'
import Balances from 'components/portfolio/Account/Balances'
import BreadCrumbs from 'components/portfolio/Account/BreadCrumbs'
import Summary from 'components/portfolio/Account/Summary'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useUrlAddress from 'hooks/wallet/useUrlAddress'
import useV1Account from 'hooks/v1/useV1Account'
import useStore from 'store'
import { getRoute } from 'utils/route'

export default function PortfolioV1Page() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlAddress = useUrlAddress()
  const walletAddress = useStore((s) => s.address)
  const { data: account } = useV1Account(urlAddress || walletAddress)
  const address = useStore((s) => s.address)
  const { data: accountIds } = useAccountIds(address)
  const isUsersAccount = account && accountIds ? accountIds.includes(account.id) : false

  if (!account) {
    navigate(getRoute('portfolio', searchParams, urlAddress))
    return null
  }

  return (
    <div className='flex flex-wrap w-full gap-2 py-8'>
      <BreadCrumbs label='Red Bank v1' />
      <Summary account={account} v1 />
      <Balances account={account} isUsersAccount={isUsersAccount} />
      <ShareBar text='Have a look at this Red Bank v1 portfolio on @mars_protocol!' />
    </div>
  )
}
