import classNames from 'classnames'
import { ReactNode } from 'react'
import { NavLink as Link } from 'react-router-dom'

interface Props {
  href: string
  children: string | ReactNode
  isActive?: boolean
  className?: string
  onClick?: () => void
  target?: string
}

export const NavLink = (props: Props) => {
  return (
    <Link
      to={props.href}
      onClick={props.onClick ? props.onClick : undefined}
      className={classNames(
        props.className,
        'font-semibold hover:text-white active:text-white',
        props.isActive ? 'pointer-events-none text-white' : 'text-white/60',
      )}
      target={props.target}
    >
      {props.children}
    </Link>
  )
}
