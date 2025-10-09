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
          'max-w-screen-full fixed isolate z-50 shadow-overlay bg-surface border border-white/20 rounded-sm',
          'md:absolute',
          props.className,
        )}
      >
        {props.children ? props.children : props.content}
      </div>
      <div
        className='fixed inset-0 z-40 block w-full h-full hover:cursor-pointer'
        onClick={onClickAway}
        role='button'
      />
    </>
  ) : null
}
