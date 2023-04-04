import classNames from 'classnames'
import Link from 'next/link'
import { ReactNode } from 'react'

interface Props {
  href: string
  children: string | ReactNode
  isActive: boolean
}

export const NavLink = (props: Props) => {
  return (
    <Link
      href={props.href}
      className={classNames(
        'text-sm font-semibold hover:text-white active:text-white',
        props.isActive ? 'pointer-events-none text-white' : 'text-white/60',
      )}
    >
      {props.children}
    </Link>
  )
}
