import classNames from 'classnames'

import Button from 'components/Button'
import Divider from 'components/Divider'
import { ChevronDown } from 'components/Icons'
import { NavLink } from 'components/Navigation//NavLink'
import { getIsActive } from 'components/Navigation/DesktopNavigation'
import Text from 'components/Text'
import useToggle from 'hooks/useToggle'

interface Props {
  item: MenuTreeEntry
}

export const NavMenu = (props: Props) => {
  const { item } = props
  const [showMenu, setShowMenu] = useToggle()

  if (!item.submenu) return null

  return (
    <div className='relative flex items-center'>
      <Button
        rightIcon={<ChevronDown className='w-3' />}
        color='quaternary'
        variant='transparent'
        onClick={() => setShowMenu(!showMenu)}
        text={item.label}
        className={classNames(
          '!text-base !p-0 !min-h-0',
          (getIsActive(item.pages) || showMenu) && '!text-white',
        )}
      />
      {showMenu && (
        <>
          <div className='absolute left-0 top-[calc(100%+4px)] z-50'>
            <ul
              className={classNames(
                'py-4 list-none flex flex-wrap gap-2 bg-white/10 backdrop-blur-lg',
                'relative isolate max-w-full overflow-hidden rounded-sm',
                'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-sm before:p-[1px] before:border-glas',
              )}
            >
              {item.submenu.map((submenuitem, index) => (
                <li className='w-full m-0 group/submenuitem' key={index}>
                  {index !== 0 && <Divider className='mb-2' />}
                  <NavLink
                    item={{ pages: [submenuitem.page], label: submenuitem.label }}
                    onClick={() => setShowMenu(false)}
                    className='flex items-center w-full gap-4 px-4 whitespace-nowrap'
                  >
                    {submenuitem.icon && <div className='w-6'>{submenuitem.icon}</div>}
                    <Text className='flex flex-wrap'>
                      {submenuitem.label}
                      {submenuitem.subtitle && (
                        <span
                          className={classNames(
                            'w-full text-sm group-hover/submenuitem:text-white',
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
          <div
            className='fixed -top-6 -left-[55px] z-40 w-screen h-screen hover:cursor-pointer'
            onClick={() => setShowMenu(false)}
            role='button'
          />
        </>
      )}
    </div>
  )
}
