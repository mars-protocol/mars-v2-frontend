import classNames from 'classnames'
import { ReactNode } from 'react'

interface Props {
  value: string
  maxLength?: number
  placeholder?: string
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  className?: string
  required?: boolean
  footer?: ReactNode
}

export default function TextArea(props: Props) {
  const { value, maxLength, placeholder, onChange, className, required = false, footer } = props

  return (
    <>
      <textarea
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        className={classNames(
          'w-full p-4 mt-3 h-28 outline-none border rounded-sm resize-none bg-white/5 border-white/10 focus:border-white/20 focus: hover:cursor-pointer placeholder:text-white/60 text-sm',
          className,
        )}
      />
      {footer && <div className='mt-1'>{footer}</div>}
    </>
  )
}
