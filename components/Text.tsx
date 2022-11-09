import React, { ReactNode } from 'react'
import classNames from 'classnames'

interface TextProps {
  classes?: string | string[]
  monospace?: boolean
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '6xl'
  tag?: 'p' | 'span'
  uppercase?: boolean
  children: ReactNode | string
}

const Text = ({
  classes,
  monospace = false,
  size = 'base',
  tag = 'p',
  uppercase = false,
  children,
}: TextProps) => {
  const c = classNames(
    classes,
    uppercase ? `text-${size}-caps` : `text-${size}`,
    monospace && 'number'
  )

  return tag === 'span' ? <span className={c}>{children}</span> : <p className={c}>{children}</p>
}

export default Text
