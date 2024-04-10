import classNames from 'classnames'
import React, { useEffect, useState } from 'react'

interface Props {
  text: string | undefined
  className: string
  style?: {}
  disabled?: boolean
  placeholder?: string
  onChange: (text: string) => void
  onBlur?: () => void
  onFocus?: () => void
  onRef?: (ref: React.RefObject<HTMLInputElement>) => void
}

export default function TextInput(props: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const cursorRef = React.useRef(0)

  useEffect(() => {
    if (!props.onRef) return
    props.onRef(inputRef)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputRef, props.onRef])

  const onInputFocus = () => {
    inputRef.current?.select()
    props.onFocus && props.onFocus()
  }

  return (
    <input
      ref={inputRef}
      type='text'
      value={props.text}
      onFocus={onInputFocus}
      onChange={(e) => props.onChange(e.target.value)}
      onBlur={props.onBlur}
      disabled={props.disabled}
      className={classNames(
        'w-full hover:cursor-pointer appearance-none border-none bg-transparent outline-none text-sm',
        props.className,
      )}
      style={props.style}
      placeholder={props.placeholder}
    />
  )
}
