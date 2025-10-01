import classNames from 'classnames'

import { ChevronDown } from 'components/common/Icons'
import Text from 'components/common/Text'
import { getIsActive } from 'components/header/navigation/desktop/DesktopNavigation'
import { NavLink } from 'components/header/navigation/desktop/NavLink'
import useToggle from 'hooks/common/useToggle'

interface Props {
  item: MenuTreeEntry
  index: number
}

export const NavMenu = (props: Props) => {
  const { item, index } = props
  const [showMenu, setShowMenu] = useToggle()

  if (!item.submenu) return null

  return (
    <div
      className={`@nav-${index}/navigation:inline-block hidden relative items-center pb-2 -mb-2 pt-0.5`}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div
        onMouseOver={() => {
          if (!showMenu) setShowMenu(true)
        }}
        className={classNames('text-base p-0 flex gap-2', showMenu && '!text-white')}
        onClick={() => setShowMenu(false)}
      >
        <NavLink
          key={index}
          item={{ pages: [item.pages[0]], label: item.label }}
          className={classNames(
            'whitespace-nowrap',
            (getIsActive(item.pages) || showMenu) && '!text-white',
          )}
        >
          {item.label}
        </NavLink>
        <ChevronDown className='w-3' />
      </div>
      {showMenu && (
        <>
          <div
            className='absolute left-0 z-50 top-full'
            onMouseLeave={() => {
              if (showMenu) setShowMenu(false)
            }}
          >
            <ul
              className={classNames(
                'list-none flex flex-wrap bg-surface border border-white/10',
                'relative isolate max-w-full overflow-hidden rounded-sm',
              )}
            >
              {item.submenu.map((submenuitem, index) => (
                <li
                  className='w-full p-0 m-0 group/submenuitem border-b border-white/10 last:border-b-0'
                  key={index}
                >
                  <NavLink
                    item={{ pages: [submenuitem.page], label: submenuitem.label }}
                    onClick={() => {
                      if (showMenu) setShowMenu(false)
                    }}
                    className='flex items-center w-full gap-4 p-4 whitespace-nowrap'
                  >
                    {submenuitem.icon && <div className='w-4'>{submenuitem.icon}</div>}
                    <Text className='flex flex-wrap' size='sm'>
                      {submenuitem.label}
                      {submenuitem.subtitle && (
                        <span
                          className={classNames(
                            'w-full text-xs group-hover/submenuitem:text-white',
                            getIsActive([submenuitem.page]) ? 'text-white' : 'text-white/40',
                          )}
                        >
                          {submenuitem.subtitle}
                        </span>
                      )}
                    </Text>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
