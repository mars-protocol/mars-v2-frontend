import classNames from 'classnames'
import { ReactNode, useEffect, useRef } from 'react'

import Card from 'components/Card'

import EscButton from './Button/EscButton'

interface Props {
  header: string | ReactNode
  headerClassName?: string
  hideCloseBtn?: boolean
  children?: ReactNode | string
  content?: ReactNode | string
  className?: string
  contentClassName?: string
  modalClassName?: string
  open: boolean
  onClose: () => void
}

export default function Modal(props: Props) {
  const ref: any = useRef(null)

  function onClose() {
    ref.current?.close()
    props.onClose()
  }

  useEffect(() => {
    if (props.open) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [props.open])

  // close dialog on unmount
  useEffect(() => {
    const dialog = ref.current
    return () => {
      dialog.removeAttribute('open')
      dialog.close()
    }
  }, [])

  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      className={classNames(
        'w-[895px] border-none bg-transparent text-white',
        'focus-visible:outline-none',
        'backdrop:bg-black/50 backdrop:backdrop-blur-sm',
        props.modalClassName,
      )}
    >
      <Card
        className={classNames(
          'relative flex max-w-full flex-grow bg-white/5 backdrop-blur-3xl',
          props.className,
        )}
      >
        <div className={classNames('flex justify-between', props.headerClassName)}>
          {props.header}
          {!props.hideCloseBtn && <EscButton onClick={props.onClose} />}
        </div>
        <div className={classNames(props.contentClassName, 'flex-grow')}>
          {props.children ? props.children : props.content}
        </div>
      </Card>
    </dialog>
  )
}
