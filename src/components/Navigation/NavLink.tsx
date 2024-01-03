import classNames from 'classnames'
import { ReactNode } from 'react'
import { NavLink as Link, useSearchParams } from 'react-router-dom'

import { getIsActive } from 'components/Navigation/DesktopNavigation'
import useAccountId from 'hooks/useAccountId'
import useStore from 'store'
import { getRoute } from 'utils/route'

interface Props {
  children: string | ReactNode
  item: MenuTreeEntry
  isHome?: boolean
  className?: string
  onClick?: () => void
  onMouseOver?: () => void
}

export const NavLink = (props: Props) => {
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const { isHome, item, className, onClick } = props
  const accountId = useAccountId()

  const itemLink = item.externalUrl
    ? item.externalUrl
    : getRoute(item.pages[0], searchParams, address, accountId)
  const link = isHome ? getRoute('trade', searchParams, address, accountId) : itemLink

  return (
    <Link
      to={link}
      onClick={onClick ? onClick : undefined}
      className={classNames(
        className,
        'font-semibold hover:text-white active:text-white group-hover/submenuitem:text-white',
        getIsActive(item.pages) ? 'pointer-events-none text-white' : 'text-white/60',
      )}
      target={item.externalUrl ? '_blank' : undefined}
    >
      {props.children}
    </Link>
  )
}
