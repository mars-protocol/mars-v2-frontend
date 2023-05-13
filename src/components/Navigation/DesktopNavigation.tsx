import { menuTree } from 'components/Header/DesktopHeader'
import { Logo } from 'components/Icons'
import { NavLink } from 'components/Navigation/NavLink'
import useParams, { getRoute } from 'utils/route'

export default function DesktopNavigation() {
  const params = useParams()

  function getIsActive(href: string) {
    if (params.page.includes('earn') && href.includes('earn')) return true
    return params.page === href
  }

  return (
    <div className='flex flex-grow items-center'>
      <NavLink href={getRoute(params, { page: 'trade' })}>
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
