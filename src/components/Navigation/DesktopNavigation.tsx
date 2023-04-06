'use client'

import Link from 'next/link'

import { menuTree } from 'components/Header/DesktopHeader'
import { Logo } from 'components/Icons'
import { NavLink } from 'components/Navigation/NavLink'
import useParams from 'hooks/useParams'
import { getRoute } from 'utils/route'

export default function DesktopNavigation() {
  const params = useParams()

  return (
    <div className='flex flex-grow items-center'>
      <Link href={getRoute(params, { page: 'trade' })}>
        <span className='block h-10 w-10'>
          <Logo />
        </span>
      </Link>
      <div className='flex gap-8 px-6'>
        {menuTree.map((item, index) => (
          <NavLink
            key={index}
            href={getRoute(params, { page: item.href })}
            isActive={params.page === item.href}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
