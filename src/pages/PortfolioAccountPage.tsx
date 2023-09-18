import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Balances from 'components/Portfolio/Account/Balances'
import BreadCrumbs from 'components/Portfolio/Account/BreadCrumbs'
import Summary from 'components/Portfolio/Account/Summary'
import useAccountId from 'hooks/useAccountId'
import { getRoute } from 'utils/route'

export default function PortfolioAccountPage() {
  const accountId = useAccountId()
  const { address } = useParams()
  const navigate = useNavigate()

  if (!accountId) {
    navigate(getRoute('portfolio', address, accountId))
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
