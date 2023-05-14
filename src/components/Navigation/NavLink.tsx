import classNames from 'classnames'
import { ReactNode } from 'react'
import { NavLink as Link } from 'react-router-dom'

interface Props {
  page: string
  children: string | ReactNode
  isActive?: boolean
}

export const NavLink = (props: Props) => {
  return (
    <Link
      to={props.page}
      className={({ isActive }) =>
        classNames(
          'text-sm font-semibold hover:text-white active:text-white',
          isActive ? 'pointer-events-none text-white' : 'text-white/60',
        )
      }
    >
      {props.children}
    </Link>
  )
}
