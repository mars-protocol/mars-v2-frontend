import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'react'

import { CircularProgress } from 'components/common/CircularProgress'
import { ChevronDown } from 'components/common/Icons'
import Overlay from 'components/common/Overlay'
import Option from 'components/common/Select/Option'
import Text from 'components/common/Text'
import useAssets from 'hooks/assets/useAssets'
import useToggle from 'hooks/common/useToggle'
import { BNCoin } from 'types/classes/BNCoin'
import { getCoinValue } from 'utils/formatters'

interface Props {
  options: SelectOption[]
  defaultValue?: string
  onChange: (value: string) => void
  isParent?: boolean
  className?: string
  title?: string
  label?: string
  displayClassName?: string
  containerClassName?: string
}

export default function Select(props: Props) {
  const [value, setValue] = useState(props.defaultValue)
  const selectedOption = value
    ? props.options.find((option) => option?.value === value || option?.denom === value)
    : undefined
  const [selected, setSelected] = useState<SelectOption | undefined>(undefined)
  const [showDropdown, setShowDropdown] = useToggle()
  const [isAssetsLoading, setIsAssetsLoading] = useState(false)
  const [sortedOptions, setSortedOptions] = useState<React.ReactNode[]>([])
  const { data: assets } = useAssets()

  const handleChange = useCallback(
    (optionValue: string) => {
      setValue(optionValue)
      const option = props.options.find(
        (option) => option?.value === optionValue || option?.denom === optionValue,
      )
      if (!option) return
      setSelected(option)
      setShowDropdown(false)
      props.onChange(optionValue)
    },
    [props, setShowDropdown],
  )

  const getOptionValue = useCallback(
    (option: SelectOption) => {
      if (option.denom && option.amount && assets) {
        return (
          getCoinValue(
            BNCoin.fromDenomAndBigNumber(option.denom, option.amount),
            assets,
          )?.toNumber?.() ?? 0
        )
      }
      return option.amount?.toNumber() ?? 0
    },
    [assets],
  )

  const getSortedOptions = useCallback(() => {
    const start = performance.now()
    const sorted = props.options
      .slice()
      .sort((a, b) => getOptionValue(b) - getOptionValue(a))
      .map((option: SelectOption, index: number) => (
        <Option
          key={index}
          {...option}
          isSelected={
            option?.value ? option?.value === selected?.value : option?.denom === selected?.denom
          }
          onClick={handleChange}
        />
      ))
    const end = performance.now()
    const sortingTime = end - start

    const remainingTime = Math.max(0, 50 - sortingTime)
    setTimeout(() => {
      setSortedOptions(sorted)
      setIsAssetsLoading(false)
    }, remainingTime)
  }, [getOptionValue, handleChange, props.options, selected])

  const handleToggleDropdown = useCallback(() => {
    if (!showDropdown) {
      setIsAssetsLoading(true)
      setShowDropdown(true)
      getSortedOptions()
    } else {
      setShowDropdown(false)
    }
  }, [showDropdown, setShowDropdown, getSortedOptions])

  useEffect(() => {
    if (selectedOption && !selected) setSelected(selectedOption)

    if (props.defaultValue && value === props.defaultValue) return
    setValue(props.defaultValue)
    const option = props.options.find(
      (option) => option?.value === props.defaultValue || option?.denom === props.defaultValue,
    )
    if (!option) return
    setSelected(option)
  }, [value, props.defaultValue, props.options, selected, selectedOption])

  return (
    <div className={classNames('flex flex-col flex-wrap', props.containerClassName)}>
      {props.label && (
        <Text size='sm' className='w-full mb-2'>
          {props.label}
        </Text>
      )}
      <div
        data-testid='select-component'
        className={classNames(
          props.isParent && 'relative',
          'flex min-w-fit items-center gap-2',
          props.className,
        )}
        role='select'
        onClick={handleToggleDropdown}
      >
        {selected ? (
          <Option
            {...selected}
            isClicked={showDropdown}
            displayClassName={props.displayClassName}
            isDisplay
          />
        ) : (
          <div className='flex items-center gap-2 p-3 hover:cursor-pointer'>
            <Text className='w-full opacity-50 hover:cursor-pointer'>Select</Text>
            <span
              className={classNames(
                'inline-block w-2.5 transition-transform',
                showDropdown ? 'rotate-0' : '-rotate-90',
              )}
            >
              <ChevronDown />
            </span>
          </div>
        )}
        <Overlay
          show={showDropdown}
          className={classNames('left-0 top-[calc(100%+8px)] absolute! isolate w-full')}
          setShow={handleToggleDropdown}
          hasBackdropIsolation
        >
          <div className='relative w-full overflow-hidden rounded-sm isolate'>
            {props.title && (
              <Text size='sm' className='block p-4 font-bold bg-white/25'>
                {props.title}
              </Text>
            )}
            {isAssetsLoading ? (
              <div className='flex justify-center items-center px-4 py-10'>
                <CircularProgress size={24} />
              </div>
            ) : (
              <div className='w-full overflow-y-scroll max-h-70 scrollbar-hide'>
                {sortedOptions}
              </div>
            )}
          </div>
        </Overlay>
      </div>
    </div>
  )
}
