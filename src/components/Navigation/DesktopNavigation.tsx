import { useParams } from 'react-router-dom'
import classNames from 'classnames'

import { menuTree } from 'components/Header/DesktopHeader'
import { Logo } from 'components/Icons'
import { NavLink } from 'components/Navigation/NavLink'
import useStore from 'store'
import { getRoute } from 'utils/route'

export default function DesktopNavigation() {
  const { address, accountId } = useParams()
  const focusComponent = useStore((s) => s.focusComponent)

  function getIsActive(href: string) {
    return location.pathname.includes(href)
  }

  return (
    <div
      className={classNames(
        focusComponent ? 'absolute left-4 top-3 z-1 block' : 'flex flex-1 items-center',
      )}
    >
      <NavLink href={getRoute('trade', address, accountId)}>
        <span className='block h-10 w-10'>
          <Logo className='text-white' />
        </span>
      </NavLink>
      {!focusComponent && (
        <div className='flex gap-8 px-6'>
          {menuTree.map((item, index) => (
            <NavLink
              key={index}
              href={getRoute(item.page, address, accountId)}
              isActive={getIsActive(item.page)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}
