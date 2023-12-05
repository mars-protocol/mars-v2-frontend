import classNames from 'classnames'
import { NavLink, useParams, useSearchParams } from 'react-router-dom'

import useAccountId from 'hooks/useAccountId'
import { getRoute } from 'utils/route'

const underlineClasses =
  'relative before:absolute before:h-[2px] before:-bottom-1 before:left-0 before:right-0 before:gradient-active-tab'

interface Props {
  tabs: Tab[]
  activeTabIdx: number
}

export default function Tab(props: Props) {
  const accountId = useAccountId()
  const { address } = useParams()
  const [searchParams] = useSearchParams()

  return (
    <div className='relative w-full'>
      {props.tabs.map((tab, index) => (
        <NavLink
          key={tab.page}
          to={getRoute(tab.page, searchParams, address, accountId)}
          className={classNames(
            props.activeTabIdx === index ? underlineClasses : 'text-white/40',
            'relative mr-8 text-xl ',
          )}
        >
          {tab.name}
        </NavLink>
      ))}
    </div>
  )
}
