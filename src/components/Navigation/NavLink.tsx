'use client'

import classNames from 'classnames'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface Props {
  href: string
  children: string | ReactNode
}

export const NavLink = ({ href, children }: Props) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={classNames(
        'text-sm font-semibold hover:text-white active:text-white',
        isActive ? 'pointer-events-none text-white' : 'text-white/60',
      )}
    >
      {children}
    </Link>
  )
}
