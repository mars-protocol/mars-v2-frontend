import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Balances from 'components/Portfolio/Account/Balances'
import BreadCrumbs from 'components/Portfolio/Account/BreadCrumbs'
import Summary from 'components/Portfolio/Account/Summary'
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
    <div>
      <BreadCrumbs accountId={accountId} />
      <Summary accountId={accountId} />
      <Balances accountId={accountId} />
    </div>
  )
}
