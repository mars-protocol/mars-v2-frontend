import { NavLink, useParams, useSearchParams } from 'react-router-dom'

import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import useAccountId from 'hooks/accounts/useAccountId'
import useUrlAddress from 'hooks/wallet/useUrlAddress'
import { getRoute } from 'utils/route'

interface Props {
  accountId?: string
  label?: string
}

export default function PortfolioAccountPageHeader(props: Props) {
  const { address } = useParams()
  const urlAddress = useUrlAddress()
  const selectedAccountId = useAccountId()
  const [searchParams] = useSearchParams()

  const displayLabel = props.label || `Credit Account ${props.accountId}`

  return (
    <div className='flex items-center justify-start w-full gap-2 pt-2 pb-6 mb-8 border-b border-white/20'>
      <NavLink to={getRoute('portfolio', searchParams, urlAddress || address, selectedAccountId)}>
        <Text className='text-white/40'>Portfolio</Text>
      </NavLink>
      <div className='h-3'>
        <ArrowRight className='h-3 text-white/60 ' />
      </div>
      <Text>{displayLabel}</Text>
    </div>
  )
}
