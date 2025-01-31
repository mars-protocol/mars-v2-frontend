import classNames from 'classnames'
import { Component, ElementType, ReactNode } from 'react'

interface Props {
  children: ReactNode | string
  className?: string
  monospace?: boolean
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  tag?: 'div' | 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4'
  uppercase?: boolean
}

const headlines = ['h1', 'h2', 'h3', 'h4']
const headMap = ['6xl', '5xl', '4xl', '3xl']

export default function Text(props: Props) {
  const tag = props.tag ?? 'p'
  const size = props.size

  const tagIndex = headlines.indexOf(tag)
  const sizeClass = tagIndex > -1 ? headMap[tagIndex] : size
  const HtmlElement = tag as keyof React.JSX.IntrinsicElements

  return (
    <HtmlElement
      data-testid='text-component'
      className={classNames(
        props.className,
        sizeClass && props.uppercase && `text-${sizeClass}-caps`,
        sizeClass && !props.uppercase && `text-${sizeClass}`,
        props.monospace && 'number',
      )}
    >
      {props.children}
    </HtmlElement>
  )
}
