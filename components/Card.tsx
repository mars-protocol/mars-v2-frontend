import React, { ReactNode } from 'react'
import classNames from 'classnames'

interface TextProps {
  children: ReactNode
  className?: string
}

const Text = ({ children, className }: TextProps) => {
  const classes = classNames(
    className,
    'border-[7px] h-fit rounded-xl border-accent-highlight gradient-card w-full max-w-full p-4'
  )

  return <div className={classes}>{children}</div>
}

export default Text
