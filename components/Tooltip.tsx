import { InformationCircleIcon } from '@heroicons/react/24/solid'
import Tippy from '@tippyjs/react'
import { ReactNode } from 'react'

interface TooltipProps {
  content: string | ReactNode
  className?: string
}

const Tooltip = ({ content, className }: TooltipProps) => {
  return (
    <Tippy
      appendTo={() => document.body}
      className='rounded-md bg-[#ED512F] p-2 text-xs'
      content={<span>{content}</span>}
      interactive={true}
    >
      <InformationCircleIcon className={`w-5 cursor-pointer ${className}`} />
    </Tippy>
  )
}

export default Tooltip
