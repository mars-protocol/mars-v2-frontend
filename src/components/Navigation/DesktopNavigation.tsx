import classNames from 'classnames'
import { useParams } from 'react-router-dom'

import { menuTree } from 'components/Header/DesktopHeader'
import { Logo } from 'components/Icons'
import { NavLink } from 'components/Navigation/NavLink'
import useAccountId from 'hooks/useAccountId'
import useStore from 'store'
import { getRoute } from 'utils/route'

export default function DesktopNavigation() {
  const { address } = useParams()
  const accountId = useAccountId()

  const focusComponent = useStore((s) => s.focusComponent)

  function getIsActive(pages: string[]) {
    const segments = location.pathname.split('/')
    return pages.some((page) => segments.includes(page))
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
              href={getRoute(item.pages[0], address, accountId)}
              isActive={getIsActive(item.pages)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}
