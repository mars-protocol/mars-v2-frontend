import { NavLink, useParams, useSearchParams } from 'react-router-dom'

import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import useAccountId from 'hooks/useAccountId'
import { getRoute } from 'utils/route'

interface Props {
  accountId: string
}

export default function PortfolioAccountPageHeader(props: Props) {
  const { address } = useParams()
  const selectedAccountId = useAccountId()
  const [searchParams] = useSearchParams()

  return (
    <div className='flex items-center w-full gap-2 pt-2 pb-6 border-b border-white/20'>
      <NavLink to={getRoute('portfolio', searchParams, address, selectedAccountId)}>
        <Text className='text-white/40'>Portfolio</Text>
      </NavLink>
      <ArrowRight className='h-3 text-white/60 ' />
      <Text tag='span'>Credit Account {props.accountId}</Text>
    </div>
  )
}