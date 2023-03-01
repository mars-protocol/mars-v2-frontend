import classNames from 'classnames'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode | string
  className?: string
  monospace?: boolean
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '6xl'
  tag?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4'
  uppercase?: boolean
}

const headlines = ['h1', 'h2', 'h3', 'h4']
const headMap = ['6xl', '5xl', '4xl', '3xl']

export const Text = ({
  children,
  className,
  monospace = false,
  size = 'base',
  tag = 'p',
  uppercase = false,
}: Props) => {
  const tagIndex = headlines.indexOf(tag)
  const sizeClass = tagIndex > -1 ? headMap[tagIndex] : size
  const HtmlElement = tag as keyof JSX.IntrinsicElements

  return (
    <HtmlElement
      className={classNames(
        className,
        'flex items-center',
        uppercase ? `text-${sizeClass}-caps` : `text-${sizeClass}`,
        monospace && 'number',
      )}
    >
      {children}
    </HtmlElement>
  )
}
