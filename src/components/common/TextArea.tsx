import classNames from 'classnames'
import Text from 'components/common/Text'

interface Props {
  value: string
  maxLength?: number
  placeholder?: string
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  className?: string
  required?: boolean
}

export default function TextArea(props: Props) {
  const { value, maxLength, placeholder, onChange, className, required = false } = props

  return (
    <>
      <textarea
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        className={classNames(
          'w-full p-4 mt-3 h-28 outline-none border rounded-sm resize-none bg-white/5 border-white/10 focus:border-white/20 focus:bg-white/10 hover:cursor-pointer',
          className,
        )}
      />
      {maxLength && (
        <Text size='xs' className='mt-1 text-white/30 text-right'>
          <span
            className={classNames('text-xs mt-1', {
              'text-white/30': value.length <= 200,
              'text-warning': value.length > 200 && value.length < maxLength,
              'text-error': value.length >= maxLength,
            })}
          >
            {value.length}
          </span>
          /{maxLength}
        </Text>
      )}
    </>
  )
}
