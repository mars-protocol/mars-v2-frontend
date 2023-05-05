import classNames from 'classnames'
import { ReactNode } from 'react'

interface Props {
  children?: ReactNode | string
  content?: ReactNode | string
  className?: string
  hasBackdropIsolation?: boolean
  show: boolean
  setShow: (show: boolean) => void
}

export default function Overlay(props: Props) {
  const onClickAway = () => {
    props.setShow(false)
  }

  return props.show ? (
    <>
      <div
        className={classNames(
          'max-w-screen absolute isolate z-50 rounded-sm shadow-overlay backdrop-blur-lg',
          props.hasBackdropIsolation ? 'bg-body' : 'gradient-popover',
          'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-sm before:p-[1px] before:border-glas',
          props.className,
        )}
      >
        {props.children ? props.children : props.content}
      </div>
      <div
        className='fixed left-0 top-0 z-40 block h-full w-full hover:cursor-pointer'
        onClick={onClickAway}
        role='button'
      />
    </>
  ) : null
}
