import { useMemo } from 'react'

import { NavLink } from 'components/header/navigation/desktop/NavLink'
import { NavMenu } from 'components/header/navigation/desktop/NavMenu'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'

interface Props {
  menuTree: (chainConfig: ChainConfig) => MenuTreeEntry[]
}

export function getIsActive(pages: string[]) {
  const segments = location.pathname.split('/')
  return pages.some((page) => segments.includes(page))
}

export default function DesktopNavigation(props: Props) {
  const { menuTree } = props
  const chainConfig = useChainConfig()
  const focusComponent = useStore((s) => s.focusComponent)

  const menu = useMemo(() => menuTree(chainConfig), [chainConfig, menuTree])

  if (focusComponent) return null

  return (
    <div className='hidden md:flex gap-8 px-6 h-6 @container/navigation relative flex-1'>
      {menu.map((item, index) =>
        item.submenu ? (
          <NavMenu key={item.label} item={item} index={index} menu={menu} />
        ) : (
          <NavLink
            key={item.label}
            item={item}
            className={`@nav-${index}/navigation:inline-block hidden whitespace-nowrap`}
          >
            {item.label}
          </NavLink>
        ),
      )}
    </div>
  )
}
