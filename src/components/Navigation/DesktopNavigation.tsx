import { useParams } from 'react-router-dom'

import { menuTree } from 'components/Header/DesktopHeader'
import { Logo } from 'components/Icons'
import { NavLink } from 'components/Navigation/NavLink'
import { getRoute } from 'utils/route'

export default function DesktopNavigation() {
  const { address, accountId } = useParams()

  function getIsActive(href: string) {
    return location.pathname.includes(href)
  }

  return (
    <div className='flex flex-grow items-center'>
      <NavLink href={getRoute('trade', address, accountId)} isActive={false}>
        <span className='block h-10 w-10'>
          <Logo />
        </span>
      </NavLink>
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
    </div>
  )
}
