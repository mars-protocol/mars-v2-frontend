import classNames from 'classnames'
import { ReactNode } from 'react'

import { Close } from 'components/Icons'
import { Card } from 'components/Card'

interface Props {
  children?: ReactNode | string
  content?: ReactNode | string
  className?: string
  open: boolean
  setOpen?: (open: boolean) => void
}

export const Modal = ({ children, content, className, open, setOpen }: Props) => {
  const onClickAway = () => {
    if (setOpen) setOpen(false)
  }

  return open ? (
    <div className='fixed top-0 left-0 z-20 h-screen w-screen'>
      <div className='relative flex h-full w-full items-center justify-center'>
        <Card className={classNames('relative z-40 w-[790px] max-w-full p-0', className)}>
          {setOpen && (
            <span
              className='absolute top-4 right-4 z-50 w-[32px] text-white opacity-60 hover:cursor-pointer hover:opacity-100'
              onClick={onClickAway}
              role='button'
            >
              <Close />
            </span>
          )}
          {children ? children : content}
        </Card>
        <div
          className='fixed top-0 left-0 z-30 block h-full w-full bg-black/70 backdrop-blur hover:cursor-pointer'
          onClick={onClickAway}
          role='button'
        />
      </div>
    </div>
  ) : null
}
