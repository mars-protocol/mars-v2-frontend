import classNames from 'classnames'
import { Search } from 'components/common/Icons'
import {
  ChangeEvent,
  forwardRef,
  InputHTMLAttributes,
  KeyboardEvent,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  className?: string
  label?: string
  children?: React.ReactNode
  onEnter?: () => void
}

const SearchBar = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, className, label, children, onEnter, onKeyDown, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onEnter) {
        e.preventDefault()
        onEnter()
      }
      // Call the original onKeyDown if provided
      onKeyDown?.(e)
    }

    const handleFocus = () => {
      setIsExpanded(true)
    }

    const handleBlur = () => {
      if (!value) {
        setIsExpanded(false)
      }
    }

    return (
    <div
      className={classNames(
        'relative flex items-center bg-surface-dark rounded-sm overflow-visible',
        'outline-[1.50px] outline-offset-[-1.50px] outline-zinc-700 light:outline-zinc-400',
        'focus-within:outline-zinc-600 light:focus-within:outline-zinc-300',
        'transition-all duration-300 ease',
        isExpanded || value ? 'w-40 pl-10 pr-3' : 'w-10',
        className,
      )}
    >
      {label && (
        <label
          className={classNames(
            'absolute left-10 -top-2 text-xs text-white/40 pointer-events-none z-20 bg-surface-dark px-1',
            'transition-all duration-300 ease',
            isExpanded || value ? 'opacity-100 visible' : 'opacity-0 invisible',
            'peer-focus:-translate-y-1/2 peer-focus:scale-[0.8] peer-focus:-top-2 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:scale-[0.8] peer-[:not(:placeholder-shown)]:-top-2',
          )}
        >
          {label}
        </label>
      )}

      <div
        className={classNames(
          'absolute left-0 w-10 h-10 flex items-center justify-center z-10',
          isExpanded || value
            ? 'pointer-events-none cursor-default'
            : 'pointer-events-auto cursor-pointer',
        )}
        onClick={() => {
          if (!isExpanded) {
            setIsExpanded(true)
            // Focus the input after a brief delay to ensure it's rendered
            setTimeout(() => {
              inputRef.current?.focus()
            }, 50)
          }
        }}
      >
        <Search className='w-4 h-4 text-white/40' />
      </div>

      <div
        className={classNames(
          'relative transition-all duration-300',
          isExpanded || value ? 'opacity-100 visible flex-1' : 'opacity-0 invisible w-0',
        )}
      >
        <input
          ref={inputRef}
          type='text'
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder=' '
          className={classNames(
            'peer bg-transparent text-xs text-white placeholder:text-transparent outline-none w-full',
            isExpanded || value ? 'cursor-text' : 'cursor-pointer',
          )}
          {...props}
        />
      </div>
      {children}
    </div>
    )
  },
)

SearchBar.displayName = 'SearchBar'

export default SearchBar
