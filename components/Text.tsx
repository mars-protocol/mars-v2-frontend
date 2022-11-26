import React, { ReactNode } from 'react'
import classNames from 'classnames'

interface Props {
  children: ReactNode | string
  className?: string
  monospace?: boolean
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '6xl'
  tag?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4'
  uppercase?: boolean
}

const Text = ({
  children,
  className,
  monospace = false,
  size = 'base',
  tag = 'p',
  uppercase = false,
}: Props) => {
  const headlines = ['h1', 'h2', 'h3', 'h4']
  const headMap = ['6xl', '5xl', '4xl', '3xl']
  const tagIndex = headlines.indexOf(tag)
  const sizeClass = tagIndex > -1 ? headMap[tagIndex] : size
  const classes = classNames(
    className,
    uppercase ? `text-${sizeClass}-caps` : `text-${sizeClass}`,
    monospace && 'number',
  )
  const HtmlElement = tag as keyof JSX.IntrinsicElements

  return <HtmlElement className={classes}>{children}</HtmlElement>
}

export default Text
