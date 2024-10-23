import classNames from 'classnames'
import { ReactNode } from 'react'
import { NavLink as Link, useSearchParams } from 'react-router-dom'

import { ExternalLink } from 'components/common/Icons'
import { getIsActive } from 'components/header/navigation/desktop/DesktopNavigation'
import useAccountId from 'hooks/accounts/useAccountId'
import useStore from 'store'
import useChainConfig from 'hooks/chain/useChainConfig'
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
  const chainConfig = useChainConfig()

  const defaultPage = chainConfig.perps ? 'perps' : 'trade'

  const itemLink = item.externalUrl
    ? item.externalUrl
    : getRoute(item.pages[0], searchParams, address, accountId)
  const link = isHome ? getRoute(defaultPage, searchParams, address, accountId) : itemLink

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
      <>
        {props.children}
        {item.externalUrl && <ExternalLink className='inline-block w-4 ml-1 mb-0.5' />}
      </>
    </Link>
  )
}
