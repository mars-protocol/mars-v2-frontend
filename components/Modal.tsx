import classNames from 'classnames'
import { ReactNode } from 'react'
import Card from './Card'
import { SVG } from './SVG/SVG'

interface ModalProps {
  children?: ReactNode | string
  content?: ReactNode | string
  className?: string
  open: boolean
  setOpen: (open: boolean) => void
}

const Modal = ({ children, content, className, open, setOpen }: ModalProps) => {
  const onClickAway = () => {
    setOpen(false)
  }

  return open ? (
    <>
      <Card
        className={classNames(
          'absolute top-0 left-0 right-0 bottom-0 z-40 mx-auto my-0 w-[790px] max-w-full',
          className,
        )}
      >
        <span
          className='absolute top-4 right-4 w-[32px] opacity-40 hover:cursor-pointer hover:opacity-80'
          onClick={onClickAway}
          role='button'
        >
          <SVG.Close />
        </span>
        {children ? children : content}
      </Card>
      <div
        className='fixed top-0 left-0 z-30 block h-full w-full bg-black/70 backdrop-blur hover:cursor-pointer'
        onClick={onClickAway}
        role='button'
      />
    </>
  ) : null
}

export default Modal
