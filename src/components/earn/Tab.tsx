import classNames from 'classnames'
import { NavLink, useParams, useSearchParams } from 'react-router-dom'

import useAccountId from 'hooks/accounts/useAccountId'
import { getRoute } from 'utils/route'

const underlineClasses =
  'relative before:absolute before:h-[2px] before:-bottom-1 before:left-0 before:right-0 before:gradient-active-tab'

interface Props {
  tabs: Tab[]
  activeTabIdx: number
  className?: string
  disableNavigation?: boolean
  onTabChange?: (index: number) => void
}

export default function Tab(props: Props) {
  const { tabs, activeTabIdx, className, onTabChange, disableNavigation } = props
  const accountId = useAccountId()
  const { address } = useParams()
  const [searchParams] = useSearchParams()

  const handleClick = (index: number) => {
    if (disableNavigation && onTabChange) {
      onTabChange(index)
    }
  }

  return (
    <div className={classNames('relative w-full', className)}>
      {tabs.map((tab, index) => (
        <NavLink
          key={`${tab.page}-${index}`}
          to={getRoute(tab.page, searchParams, address, accountId)}
          onClick={(e) => {
            if (disableNavigation) {
              e.preventDefault()
              handleClick(index)
            }
          }}
          className={classNames(
            activeTabIdx === index ? underlineClasses : 'text-white/40',
            'relative mr-8 text-xl cursor-pointer',
          )}
        >
          {tab.name}
        </NavLink>
      ))}
    </div>
  )
}
