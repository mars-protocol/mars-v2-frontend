import classNames from 'classnames'
import { ReactNode } from 'react'

import Button from 'components/Button'

interface Props {
  className?: string
  icon?: ReactNode
  onClick: () => void
  setShow: (show: boolean) => void
  text: string | ReactNode
}

const OverlayAction = ({ className, icon, onClick, setShow, text }: Props) => {
  return (
    <Button
      className={classNames(
        'flex items-center whitespace-nowrap py-2 text-left text-sm text-accent-dark hover:text-secondary',
        className,
      )}
      variant='text'
      onClick={() => {
        setShow(false)
        onClick()
      }}
    >
      {icon && <span className='mt-[1px] mr-2 flex w-4'>{icon}</span>}
      {text}
    </Button>
  )
}

export default OverlayAction
