import React, { ReactNode } from 'react'
import classNames from 'classnames'

interface TextProps {
  children: ReactNode | string
  className?: string
  monospace?: boolean
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '6xl'
  tag?: 'p' | 'span'
  uppercase?: boolean
}

const Text = ({
  children,
  className,
  monospace = false,
  size = 'base',
  tag = 'p',
  uppercase = false,
}: TextProps) => {
  const classes = classNames(
    className,
    uppercase ? `text-${size}-caps` : `text-${size}`,
    monospace && 'number'
  )

  return tag === 'span' ? (
    <span className={classes}>{children}</span>
  ) : (
    <p className={classes}>{children}</p>
  )
}

export default Text
