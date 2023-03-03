import classNames from 'classnames'
import { ReactNode } from 'react'

interface Props {
  children?: ReactNode | string
  content?: ReactNode | string
  className?: string
  show: boolean
  setShow: (show: boolean) => void
}

export const Overlay = ({ children, content, className, show, setShow }: Props) => {
  const onClickAway = () => {
    setShow(false)
  }

  return show ? (
    <>
      <div
        className={classNames(
          'max-w-screen absolute z-50 rounded-sm border border-white/40 shadow-overlay backdrop-blur-sticky gradient-popover',
          className,
        )}
      >
        {children ? children : content}
      </div>
      <div
        className='fixed top-0 left-0 z-40 block h-full w-full hover:cursor-pointer'
        onClick={onClickAway}
        role='button'
      />
    </>
  ) : null
}
