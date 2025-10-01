import classNames from 'classnames'
import { useMemo } from 'react'

import Button from 'components/common/Button'
import { ChevronDown } from 'components/common/Icons'
import { NavLink } from 'components/header/navigation/desktop/NavLink'
import { NavMenu } from 'components/header/navigation/desktop/NavMenu'
import useChainConfig from 'hooks/chain/useChainConfig'
import useToggle from 'hooks/common/useToggle'
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
  const [showMenu, setShowMenu] = useToggle()
  const chainConfig = useChainConfig()
  const focusComponent = useStore((s) => s.focusComponent)

  const menu = useMemo(() => menuTree(chainConfig), [chainConfig, menuTree])

  if (focusComponent) return null

  return (
    <div className='hidden md:flex gap-8 px-6 h-6 @container/navigation relative flex-1'>
      {menu.map((item, index) =>
        item.submenu ? (
          <NavMenu key={index} item={item} index={index} />
        ) : (
          <NavLink
            key={index}
            item={item}
            className={`@nav-${index}/navigation:inline-block hidden whitespace-nowrap`}
          >
            {item.label}
          </NavLink>
        ),
      )}
      <div className={`@nav-${menu.length - 1}/navigation:hidden flex items-center relative`}>
        <Button
          leftIcon={<ChevronDown className='w-3' />}
          color='quaternary'
          variant='transparent'
          onClick={() => setShowMenu(!showMenu)}
          text='More'
          className='!text-base !p-0 !min-h-0'
        />
        {showMenu && (
          <>
            <div className='absolute left-0 top-[calc(100%+4px)] z-50'>
              <ul
                className={classNames(
                  'py-4 list-none flex flex-wrap gap-2  backdrop-blur-lg',
                  'relative isolate max-w-full overflow-hidden rounded-sm',
                )}
              >
                {menu.map((item, index) => (
                  <li className={`@nav-${index}/navigation:hidden block w-full m-0`} key={index}>
                    <NavLink
                      item={item}
                      onClick={() => setShowMenu(false)}
                      className='w-full px-4 whitespace-nowrap'
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className='fixed -top-6 -left-[55px] z-40 w-screen-full h-screen-full hover:cursor-pointer'
              onClick={() => setShowMenu(false)}
              role='button'
            />
          </>
        )}
      </div>
    </div>
  )
}
