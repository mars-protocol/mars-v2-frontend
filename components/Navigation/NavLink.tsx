import TextLink from 'components/TextLink'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode } from 'react'

interface Props {
  href: string
  children: string | ReactNode
}

const NavLink = ({ href, children }: Props) => {
  const router = useRouter()
  const isActive = router.pathname === href

  return (
    <Link href={href} passHref>
      <TextLink
        className={`${isActive && 'pointer-events-none text-white'}`}
        uppercase={true}
        textSize='large'
        color='quaternary'
      >
        {children}
      </TextLink>
    </Link>
  )
}

export default NavLink
