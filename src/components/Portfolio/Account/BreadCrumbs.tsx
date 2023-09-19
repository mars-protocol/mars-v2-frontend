import React from 'react'
import { NavLink, useParams } from 'react-router-dom'

import { ArrowRight } from 'components/Icons'
import Text from 'components/Text'
import useAccountId from 'hooks/useAccountId'
import { getRoute } from 'utils/route'

interface Props {
  accountId: string
}

export default function PortfolioAccountPageHeader(props: Props) {
  const { address } = useParams()
  const selectedAccountId = useAccountId()

  return (
    <div className='flex gap-2 items-center pt-4 pb-8 border-b border-white/20'>
      <NavLink to={getRoute('portfolio', address, selectedAccountId)}>
        <Text className='text-white/60'>Portfolio</Text>
      </NavLink>
      <ArrowRight className='h-3 text-white/60' />
      <Text tag='span'>Credit Account {props.accountId}</Text>
    </div>
  )
}
