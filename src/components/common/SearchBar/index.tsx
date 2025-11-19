import classNames from 'classnames'
import { Cross, Search } from 'components/common/Icons'
import { ChangeEvent, InputHTMLAttributes } from 'react'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  className?: string
  label?: string
}

export default function SearchBar({ value, onChange, className, label, ...props }: Props) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleClear = () => {
    onChange('')
  }

  return (
    <div
      className={classNames(
        'relative flex items-center gap-2 px-3 py-1 bg-surface-dark rounded-sm',
        'outline-[1.50px] outline-offset-[-1.50px] outline-zinc-700 light:outline-zinc-400',
        'focus-within:outline-zinc-600 light:focus-within:outline-zinc-300 transition-all duration-300',
        className,
      )}
    >
      <div className='relative w-full'>
        <input
          type='text'
          value={value}
          onChange={handleChange}
          placeholder=' '
          className='peer bg-transparent text-xs text-white placeholder:text-white/40 outline-none w-full'
          {...props}
        />
        {label && (
          <label
            className={classNames(
              'absolute left-0 text-xs text-white/40 pointer-events-none',
              'transition-transform duration-150 ease-in-out',
              'peer-focus:-translate-y-1/2 peer-focus:scale-[0.8] peer-focus:-top-2 peer-focus:bg-surface-dark peer-focus:px-1',
              'peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:scale-[0.8] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:bg-surface-dark peer-[:not(:placeholder-shown)]:px-1',
            )}
          >
            {label}
          </label>
        )}
      </div>
      {value ? (
        <button
          onClick={handleClear}
          className='w-3 h-3 text-white/40 hover:text-white/60 shrink-0 transition-colors'
          type='button'
        >
          <Cross className='w-3 h-3' />
        </button>
      ) : (
        <Search className='w-4 h-4 text-white/40 shrink-0' />
      )}
    </div>
  )
}
