import { menuTree } from 'components/Header/DesktopHeader'
import { Logo } from 'components/Icons'
import { NavLink } from 'components/Navigation/NavLink'
import { useLocation, useParams } from 'react-router-dom'
import { getRoute } from 'utils/route'

export default function DesktopNavigation() {
  const params = useParams()
  const location = useLocation()

  function getIsActive(href: string) {
    return location.pathname.includes(href)
  }

  return (
    <div className='flex flex-grow items-center'>
      <NavLink href={getRoute(params, { page: 'trade' })} isActive={false}>
        <span className='block h-10 w-10'>
          <Logo />
        </span>
      </NavLink>
      <div className='flex gap-8 px-6'>
        {menuTree.map((item, index) => (
          <NavLink
            key={index}
            href={getRoute(params, { page: item.href })}
            isActive={getIsActive(item.href)}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
