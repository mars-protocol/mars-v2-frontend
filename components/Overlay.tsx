import classNames from 'classnames'
import { ReactNode } from 'react'

interface OverlayProps {
  children?: ReactNode | string
  content?: ReactNode | string
  className?: string
  show: boolean
  setShow: (show: boolean) => void
}

const Overlay = ({ children, content, className, show, setShow }: OverlayProps) => {
  const onClickAway = () => {
    setShow(false)
  }

  return show ? (
    <>
      <div
        className={classNames(
          'absolute z-50 flex max-w-full rounded-lg p-6 text-accent-dark shadow-overlay gradient-popover',
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

export default Overlay
