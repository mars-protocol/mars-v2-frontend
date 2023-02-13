import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import classNames from 'classnames'

interface Props {
  href: string
  children: string | ReactNode
}

export const NavLink = ({ href, children }: Props) => {
  const router = useRouter()
  const isActive = router.pathname === href

  return (
    <Link
      href={href}
      className={classNames(
        'text-lg-caps hover:text-white active:text-white',
        isActive ? 'pointer-events-none text-white' : 'text-white/60',
      )}
    >
      {children}
    </Link>
  )
}
