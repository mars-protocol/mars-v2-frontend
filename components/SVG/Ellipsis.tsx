import { SVGProps } from 'types'

export const Ellipsis = ({ color = '#FFFFFF' }: SVGProps) => {
  return (
    <svg viewBox='0 0 24 24'>
      <path
        d='M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'
        fill={color}
      />
    </svg>
  )
}
