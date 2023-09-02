import classNames from 'classnames'
import { ReactNode } from 'react'
import { NavLink as Link } from 'react-router-dom'

interface Props {
  href: string
  children: string | ReactNode
  isActive?: boolean
}

export const NavLink = (props: Props) => {
  return (
    <Link
      to={props.href}
      className={classNames(
        'text-sm font-semibold hover:text-white active:text-white',
        props.isActive ? 'pointer-events-none text-white' : 'text-white/60',
      )}
    >
      {props.children}
    </Link>
  )
}